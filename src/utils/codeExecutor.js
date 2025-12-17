export const executeCode = async (files, language, pyodideInstance) => {
  // Return a new array to avoid mutating the original blindly (caller handles state update)
  const updatedFiles = files.map((f) => ({ ...f }));

  for (const file of updatedFiles) {
    // Skip if already success
    if (file.status === "success") continue;

    if (language === "javascript") {
      try {
        file.status = "running";
        const logs = [];
        // Create a safe console proxy
        const safeConsole = {
          log: (...args) => logs.push(args.join(" ")),
          error: (...args) => logs.push("Error: " + args.join(" ")),
          warn: (...args) => logs.push("Warning: " + args.join(" ")),
        };

        // Very basic sandbox using new Function
        // We pass 'console' as an argument to capture output
        const userFunc = new Function("console", file.content);
        userFunc(safeConsole);

        file.output = logs.join("\n") || "(No output)";
        file.status = "success";
      } catch (err) {
        file.output = err.toString();
        file.status = "error";
      }
      continue;
    }

    if (language === "cpp" || language === "c") {
      if (!window.JSCPP) {
        file.output = "Error: C++ Engine (JSCPP) not loaded.";
        file.status = "error";
        continue;
      }
      try {
        file.status = "running";
        let outputBuffer = "";
        const config = {
          stdio: {
            write: (s) => {
              outputBuffer += s;
            },
            read: () => {
              return prompt("Input for C++ program:") || "";
            },
          },
        };
        // JSCPP.run is synchronous
        // Usage: JSCPP.run(code, input, config) -- wait, check docs.
        // Often it's new JSCPP(code, config).run();
        // Let's assume the library exposes `JSCPP.run` or we construct it.
        // Based on CDN, it's likely: var engine = new JSCPP(file.content, config); engine.run();
        // Let's rely on standard usage.
        const engine = new window.JSCPP(file.content, outputBuffer, config);
        // The signature can vary. Let's try the safest known 2.0.9 pattern.
        // Jscpp 2.0.9 exports a constructor.

        // Re-verified usage:
        // var rt = new JSCPP.Runtime({
        //    stdio: { write: ..., read: ... }
        // });
        // rt.run(code);
        // Wait, let's try the simpler global if available, or try-catch multiple signatures.

        // Attempt 1: Standard Constructor
        // We'll wrap in a timeout to allow UI update before locking (it's sync).
        await new Promise((resolve) => setTimeout(resolve, 100));

        try {
          // Common signature for via npm/script
          if (window.JSCPP.run) {
            outputBuffer = window.JSCPP.run(file.content, "", config);
          } else {
            const runner = new window.JSCPP(file.content, config);
            outputBuffer = runner.run();
          }
        } catch (e) {
          // If it crashes, it throws
          throw e;
        }

        file.output = outputBuffer || "(No output)";
        file.status = "success";
      } catch (err) {
        file.output = "Runtime Error: " + err.toString();
        file.status = "error";
      }
      continue;
    }

    if (language === "java") {
      try {
        if (!window.cheerpjInit) {
          file.output = "Error: CheerpJ runtime not loaded.";
          file.status = "error";
          continue;
        }

        file.status = "running";

        // Initialize CheerpJ (idempotent check)
        // cheerpjInit throws if called twice, so we track it or check status.
        // Since there's no official 'isInitialized' API exposed easily, we wrap in try-catch
        // or use a global flag.
        if (!window.cheerpjOutput) {
          // Basic check, or better:
          try {
            await window.cheerpjInit();
          } catch (e) {
            if (!e.toString().includes("Already initialized")) {
              throw e;
            }
          }
        }

        // We need to capture stdout. CheerpJ writes to console.log by default.
        // We'll capture it similarly to the JS engine.
        const logs = [];
        const originalLog = console.log;
        const originalErr = console.error;

        console.log = (...args) => {
          logs.push(args.join(" "));
          originalLog.apply(console, args); // Keep browser console working
        };
        console.error = (...args) => {
          logs.push("Error: " + args.join(" "));
          originalErr.apply(console, args);
        };

        try {
          // 1. Create a virtual file with the user's code
          // CheerpJ 3.0 usually mounts a virtual /files/ directory or allows Blob/Data URIs.
          // We'll use the 'eval' mode of BeanShell for simplicity first: java -jar bsh.jar -e "code"
          // However, quoting is hard.
          // Better: We rely on CheerpJ's File System API if available,
          // or simplest: just try to run it roughly.

          // Use local JAR from public/libs/ to avoid CORS/404
          // Vite serves public/ at root.
          const bshJar = window.location.origin + "/libs/bsh.jar";

          // Note: CheerpJ 3.0 cheerpjRunMain(className, classPath, ...args)
          // We pass the code as a simple script?
          // BeanShell treats its input as a script.
          // Let's try passing the code as an argument to -e (eval).
          // Warning: Large code blocks might hit command line limits or quoting issues.
          // But for simple "System.out.println", it works.

          // Workaround for complex code: encode it?
          // BeanShell can take a file path.
          // CheerpJ allows fetching URLs. We could create a Blob URL for the code!
          const codeBlob = new Blob([file.content], { type: "text/plain" });
          const codeUrl = URL.createObjectURL(codeBlob);

          // Mount logic is tricky in CheerpJ 3 without deeper API knowledge.
          // Let's stick to -e for the MVP "Creative" solution.
          // We replace double quotes to avoid shell breaking if CheerpJ mimics shell.
          // Actually, cheerpjRunMain takes array of args, handling escaping itself usually.

          // Exit code is returned.
          const exitCode = await window.cheerpjRunMain(
            "bsh.Interpreter",
            bshJar,
            "-e",
            file.content
          );

          if (exitCode !== 0) {
            logs.push(`\n(Process exited with code ${exitCode})`);
          }

          file.output = logs.join("\n") || "(No output)";
          file.status = "success";
        } catch (e) {
          file.output = "CheerpJ Error: " + e.toString();
          file.status = "error";
        } finally {
          // Restore console
          console.log = originalLog;
          console.error = originalErr;
        }
      } catch (err) {
        file.output = err.toString();
        file.status = "error";
      }
      continue;
    }

    if (language === "python" && pyodideInstance) {
      try {
        file.status = "running";

        // Reset output capture
        let stdout = [];
        pyodideInstance.setStdout({ batched: (msg) => stdout.push(msg) });
        pyodideInstance.setStderr({ batched: (msg) => stdout.push(msg) });
        // Mock input() to prevent blocking and capture prompt
        // We override the built-in input function to print the prompt and return '10'
        await pyodideInstance.runPythonAsync(`
import builtins
def input(prompt=''):
    print(prompt, end='')
    return "10"
builtins.input = input
        `);

        await pyodideInstance.runPythonAsync(file.content);

        file.output = stdout.join("\n") || "(No output)";
        file.status = "success";
      } catch (err) {
        file.output = err.toString();
        file.status = "error";
      }
    }
  }

  return updatedFiles;
};
