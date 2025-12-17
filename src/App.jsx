import { useState } from "react";
import SubmissionForm from "./components/SubmissionForm";
import { languages, getLanguage } from "./config/languages";
import clsx from "clsx";

function App() {
  const [currentLangId, setCurrentLangId] = useState("python");
  const currentLang = getLanguage(currentLangId);

  return (
    <div
      className={clsx(
        "h-screen w-screen overflow-hidden flex flex-col font-sans transition-all duration-1000 bg-black",
        currentLang.theme.app_gradient,
        currentLang.theme.text_primary
      )}
    >
      {/* Dynamic Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className={clsx(
            "absolute top-[-10%] left-[-10%] w-[60vh] h-[60vh] rounded-full blur-[100px] opacity-40 transition-all duration-1000 animate-pulse",
            currentLang.theme.blob_color
          )}
          style={{ animationDuration: "6s" }}
        />
        <div
          className={clsx(
            "absolute bottom-[-10%] right-[-10%] w-[60vh] h-[60vh] rounded-full blur-[100px] opacity-40 transition-all duration-1000",
            currentLang.theme.blob_color
          )}
        />
      </div>

      {/* Main Content Area - Flex Column */}
      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
        {/* Compact Header */}
        <header className="text-center mb-8 shrink-0 pt-4">
          <div className="inline-flex items-center gap-4 mb-4 opacity-90 hover:opacity-100 transition-opacity cursor-default">
            <div
              className={clsx(
                "p-3 rounded-2xl border backdrop-blur-md transition-colors duration-500",
                currentLang.theme.panel_bg,
                currentLang.theme.panel_border
              )}
            >
              <currentLang.icon
                className={clsx(
                  "w-10 h-10 transition-colors duration-500",
                  currentLang.theme.text_secondary
                )}
              />
            </div>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              <span
                className={clsx(
                  "transition-colors duration-500",
                  currentLang.theme.text_secondary
                )}
              >
                CodeSubmit
              </span>
              <span
                className={clsx("mx-3 font-thin", currentLang.theme.text_dim)}
              >
                /
              </span>
              <span
                className={clsx("font-medium", currentLang.theme.text_primary)}
              >
                Auto-Docs
              </span>
            </h1>
          </div>
          <p
            className={clsx(
              "text-sm max-w-lg mx-auto leading-relaxed transition-colors",
              currentLang.theme.text_dim
            )}
          >
            Secure, client-side assignment generator.
          </p>
        </header>

        {/* Dynamic Main Panel */}
        <main
          className={clsx(
            "w-full max-w-5xl flex-1 max-h-[75vh] min-h-0 flex flex-col", // TIGHT FIT
            "backdrop-blur-xl border rounded-3xl shadow-2xl transition-all duration-700 relative overflow-hidden",
            currentLang.theme.panel_bg,
            currentLang.theme.panel_border,
            currentLang.theme.accent_ring.replace("/30", "/5")
          )}
        >
          {/* Scrollable Form Area */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
            <SubmissionForm
              currentLangId={currentLangId}
              onLanguageChange={setCurrentLangId}
              theme={currentLang.theme}
            />
          </div>
        </main>

        {/* Compact Footer */}
        <footer
          className={clsx(
            "mt-4 text-xs text-center shrink-0 transition-colors",
            currentLang.theme.text_dim
          )}
        >
          <p>© 2025 CodeSubmit • {currentLang.name} Mode</p>
        </footer>
      </div>
    </div>
  );
}

export default App;
