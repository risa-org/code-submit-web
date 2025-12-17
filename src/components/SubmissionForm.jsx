import React, { useCallback, useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileCode,
  Play,
  Download,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
} from "lucide-react";
import clsx from "clsx";
import { generateDocx } from "../utils/docxGenerator";
import { executeCode } from "../utils/codeExecutor";
import { languages, getLanguage } from "../config/languages";

/**
 * Enhanced SubmissionForm with Monochromatic Theme Support
 * Uses generic 'theme' prop to style everything dynamically.
 */
export default function SubmissionForm({ currentLangId, onLanguageChange }) {
  const [step, setStep] = useState(1);
  // Remove local language state, use props
  const currentLang = getLanguage(currentLangId);
  const { theme } = currentLang;
  const [files, setFiles] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [pyodide, setPyodide] = useState(null);
  const [pyodideLoading, setPyodideLoading] = useState(true);
  const [processComplete, setProcessComplete] = useState(false);

  // Initialize Pyodide only if Python is active
  useEffect(() => {
    async function init() {
      try {
        if (window.loadPyodide) {
          const py = await window.loadPyodide({
            indexURL: "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/",
          });
          setPyodide(py);
          setPyodideLoading(false);
        } else {
          setTimeout(init, 500);
        }
      } catch (e) {
        console.error("Failed to load Pyodide", e);
        setPyodideLoading(false);
      }
    }

    // Only load Pyodide if selected language is executable (currently only Python)
    if (currentLang.id === "python") {
      init();
    } else {
      setPyodideLoading(false);
    }
  }, [currentLang.id]);

  // Reset files when language changes significantly (optional, but safer)
  useEffect(() => {
    setFiles([]);
    setStep(1);
  }, [currentLangId]);

  const onDrop = useCallback((acceptedFiles) => {
    acceptedFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onabort = () => console.log("file reading was aborted");
      reader.onerror = () => console.log("file reading has failed");
      reader.onload = () => {
        const binaryStr = reader.result;
        setFiles((prev) => [
          ...prev,
          {
            id: Math.random().toString(36).substr(2, 9),
            name: file.name,
            content: binaryStr,
            output: "",
            status: "pending",
          },
        ]);
      };
      reader.readAsText(file);
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    // Dynamic accept based on config
    accept: { [currentLang.mime]: currentLang.extensions },
  });

  const removeFile = (id) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleRunCode = async () => {
    if (!currentLang.isExecutable) {
      // Mock "processing" for non-executable languages so user feels progress
      setIsProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setIsProcessing(false);
      setProcessComplete(true);
      return;
    }

    if (!pyodide && currentLang.id === "python") return;
    setIsProcessing(true);

    // Execute Code
    const updatedFiles = await executeCode(files, currentLang.id, pyodide);
    setFiles(updatedFiles);

    setIsProcessing(false);
    setProcessComplete(true);
  };

  const handleGenerateDocx = async () => {
    try {
      const blob = await generateDocx(files, currentLang.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Submission_${currentLang.id}_${new Date()
        .toISOString()
        .slice(0, 10)}.docx`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Failed to generate DOCX:", e);
      alert("Failed to generate document. See console for details.");
    }
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 3));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  // Compact Stepper Header
  const Stepper = () => {
    const steps = [
      { num: 1, title: "Language" },
      { num: 2, title: "Upload" },
      { num: 3, title: "Process" },
    ];
    return (
      <div className="flex items-center justify-between relative mb-8 max-w-xl mx-auto px-4">
        <div
          className={clsx(
            "absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 rounded-full -z-10",
            theme.panel_bg
          )}
        ></div>
        <div
          className={clsx(
            "absolute left-0 top-1/2 -translate-y-1/2 h-0.5 rounded-full -z-10 transition-all duration-500",
            theme.button_bg
          )}
          style={{ width: `${((step - 1) / 2) * 100}%` }}
        ></div>

        {steps.map((s) => (
          <div key={s.num} className="flex flex-col items-center gap-1.5 px-2">
            <div
              className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ring-4",
                step >= s.num
                  ? clsx(
                      theme.button_bg,
                      "text-white shadow-lg",
                      theme.accent_ring
                    )
                  : clsx(theme.panel_bg, theme.text_dim, "ring-transparent")
              )}
            >
              {step > s.num ? <Check className="w-4 h-4" /> : s.num}
            </div>
            <span
              className={clsx(
                "text-[10px] uppercase tracking-wider font-semibold transition-colors",
                step >= s.num ? theme.text_secondary : theme.text_dim
              )}
            >
              {s.title}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="w-full max-w-4xl mx-auto h-full flex flex-col">
      <Stepper />

      {/* Step 1: Language Selection (Compact Grid) */}
      <div
        className={clsx(
          "flex-1 transition-all duration-500 min-h-0",
          step === 1
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[-20px] hidden"
        )}
      >
        <div className="text-center h-full flex flex-col justify-center">
          <h2 className={clsx("text-xl font-bold mb-6", theme.text_primary)}>
            Select Language
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {languages.map((lang) => {
              const isActive = currentLangId === lang.id;
              const lTheme = lang.theme;
              return (
                <button
                  key={lang.id}
                  onClick={() => onLanguageChange(lang.id)}
                  className={clsx(
                    "group p-4 rounded-xl border transition-all duration-300 text-left flex flex-col items-center justify-center gap-3 relative overflow-hidden",
                    "hover:scale-[1.02] active:scale-[0.98]",
                    isActive
                      ? clsx(
                          lTheme.panel_bg,
                          lTheme.panel_border,
                          "shadow-xl ring-1",
                          lTheme.accent_ring.replace("/30", "/50")
                        )
                      : "bg-transparent border-transparent hover:border-slate-800/50 hover:bg-slate-900/40"
                  )}
                >
                  <div
                    className={clsx(
                      "w-10 h-10 rounded-full flex items-center justify-center transition-colors",
                      isActive
                        ? clsx(lTheme.button_bg, "text-white")
                        : "bg-slate-800/50 text-slate-500"
                    )}
                  >
                    <lang.icon className="w-5 h-5" />
                  </div>
                  <div className="text-center">
                    <h3
                      className={clsx(
                        "font-bold text-sm",
                        isActive ? lTheme.text_primary : "text-slate-400"
                      )}
                    >
                      {lang.name}
                    </h3>
                  </div>
                  {lang.id === "python" &&
                    currentLangId === "python" &&
                    pyodideLoading && (
                      <Loader2 className="absolute top-2 right-2 w-3 h-3 animate-spin opacity-50" />
                    )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Step 2: Upload (Compact) */}
      <div
        className={clsx(
          "flex-1 transition-all duration-500 min-h-0 flex flex-col",
          step === 2
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[20px] hidden"
        )}
      >
        <h2
          className={clsx(
            "text-xl font-bold mb-4 text-center",
            theme.text_primary
          )}
        >
          Upload Files
        </h2>

        <div
          {...getRootProps()}
          className={clsx(
            "border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 group mb-4 shrink-0",
            isDragActive
              ? clsx(theme.panel_border, theme.panel_bg, "scale-[1.01]")
              : "border-slate-800/50 hover:border-slate-700 hover:bg-slate-900/20"
          )}
        >
          <input {...getInputProps()} />
          <div
            className={clsx(
              "inline-flex items-center justify-center p-4 rounded-full mb-3 transition-transform duration-300 group-hover:scale-110",
              theme.panel_bg
            )}
          >
            <Upload className={clsx("w-6 h-6", theme.text_secondary)} />
          </div>
          <p className={clsx("text-lg font-medium mb-1", theme.text_primary)}>
            {isDragActive ? "Drop here..." : "Drag & drop files"}
          </p>
          <p className={clsx("text-xs", theme.text_dim)}>
            Supports <strong>{currentLang.extensions.join(", ")}</strong>
          </p>
        </div>

        {/* File List - Scrollable */}
        {files.length > 0 && (
          <div
            className={clsx(
              "flex-1 min-h-0 overflow-y-auto custom-scrollbar p-1 space-y-2 mb-4"
            )}
          >
            {files.map((file) => (
              <div
                key={file.id}
                className={clsx(
                  "flex items-center justify-between p-2 rounded-lg border border-transparent transition-colors",
                  theme.accent_hover
                )}
              >
                <div className="flex items-center gap-3 overflow-hidden">
                  <FileCode
                    className={clsx("w-4 h-4 shrink-0", theme.text_secondary)}
                  />
                  <div className="min-w-0">
                    <p
                      className={clsx(
                        "text-sm font-medium truncate",
                        theme.text_primary
                      )}
                    >
                      {file.name}
                    </p>
                    <p className={clsx("text-[10px]", theme.text_dim)}>
                      {file.content.length} bytes
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file.id)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Step 3: Process */}
      <div
        className={clsx(
          "flex-1 transition-all duration-500 min-h-0 flex flex-col justify-center",
          step === 3
            ? "opacity-100 translate-x-0"
            : "opacity-0 translate-x-[20px] hidden"
        )}
      >
        {!processComplete ? (
          <div className="text-center py-4">
            <div
              className={clsx(
                "w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 ring-4",
                theme.panel_bg,
                theme.accent_ring
              )}
            >
              <Play className={clsx("w-8 h-8 ml-1", theme.text_secondary)} />
            </div>
            <h2 className={clsx("text-2xl font-bold mb-2", theme.text_primary)}>
              Ready
            </h2>
            <p
              className={clsx("mb-8 max-w-xs mx-auto text-sm", theme.text_dim)}
            >
              {files.length} {currentLang.name} files ready to process.
            </p>

            <button
              onClick={handleRunCode}
              disabled={
                isProcessing || (currentLang.id === "python" && !pyodide)
              }
              className={clsx(
                "px-8 py-3 text-white rounded-xl font-bold text-sm shadow-xl transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto",
                theme.button_bg,
                theme.button_hover
              )}
            >
              {isProcessing ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Play className="w-5 h-5 fill-current" />
              )}
              {isProcessing ? "Processing..." : "Run & Process"}
            </button>
          </div>
        ) : (
          <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-500/5">
              <CheckCircle className="w-8 h-8 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-emerald-100 mb-2">Done!</h2>

            <button
              onClick={handleGenerateDocx}
              className="px-6 py-3 bg-slate-100 hover:bg-white text-slate-900 rounded-xl font-bold text-sm shadow-xl shadow-white/5 transition-all hover:scale-105 active:scale-95 flex items-center gap-2 mx-auto mb-4"
            >
              <Download className="w-4 h-4" />
              Download DOCX
            </button>

            <button
              onClick={() => {
                setProcessComplete(false);
                setStep(1);
                setFiles([]);
              }}
              className={clsx(
                "text-xs font-medium hover:underline",
                theme.text_dim
              )}
            >
              Start New Submission
            </button>
          </div>
        )}
      </div>

      {/* Navigation Footer (Compact) */}
      <div className="mt-auto pt-4 flex justify-between shrink-0">
        <button
          onClick={prevStep}
          className={clsx(
            "px-4 py-2 rounded-lg font-medium text-xs transition-colors flex items-center gap-1",
            theme.text_dim,
            "hover:text-white hover:bg-slate-800/50",
            step === 1 ? "invisible" : "visible"
          )}
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>

        <button
          onClick={nextStep}
          disabled={(step === 2 && files.length === 0) || step === 3}
          className={clsx(
            "px-6 py-2 rounded-lg font-medium text-xs text-white shadow-lg transition-all flex items-center gap-1",
            step === 3
              ? "invisible"
              : step === 2 && files.length === 0
              ? "bg-slate-800 text-slate-600 cursor-not-allowed"
              : clsx(theme.button_bg, theme.button_hover)
          )}
        >
          Next <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
