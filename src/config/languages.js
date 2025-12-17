import { FileCode, FileJson, FileType, Code2 } from "lucide-react";

export const languages = [
  {
    id: "python",
    name: "Python",
    icon: FileCode,
    extensions: [".py"],
    mime: "text/x-python",
    isExecutable: true,
    description: "Execution supported.",
    theme: {
      primary: "indigo",
      app_bg: "bg-black",
      // Richer gradient: Bright top glow (500/20) -> Deep Tint (950) -> Void (Black)
      app_gradient:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-500/20 via-indigo-950/80 to-black",
      panel_bg: "bg-indigo-950/30", // More translucent to show the rich background
      panel_border: "border-indigo-500/20",
      text_primary: "text-white",
      text_secondary: "text-indigo-200",
      text_dim: "text-indigo-300/60",
      accent_ring: "ring-indigo-400", // Lighter ring for pop
      accent_hover: "hover:bg-indigo-500/20",
      button_bg: "bg-indigo-600",
      button_hover: "hover:bg-indigo-500",
      blob_color: "bg-indigo-600", // Brighter blob
    },
  },
  {
    id: "java",
    name: "Java",
    icon: FileType,
    extensions: [".java"],
    mime: "text/x-java-source",
    isExecutable: true,
    description: "Execution via CheerpJ.",
    theme: {
      primary: "orange",
      app_bg: "bg-black",
      app_gradient:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-orange-500/20 via-orange-950/80 to-black",
      panel_bg: "bg-orange-950/30",
      panel_border: "border-orange-500/20",
      text_primary: "text-white",
      text_secondary: "text-orange-200",
      text_dim: "text-orange-300/60",
      accent_ring: "ring-orange-400",
      accent_hover: "hover:bg-orange-500/20",
      button_bg: "bg-orange-600",
      button_hover: "hover:bg-orange-500",
      blob_color: "bg-orange-600",
    },
  },
  {
    id: "cpp",
    name: "C++",
    icon: Code2,
    extensions: [".cpp", ".h", ".hpp", ".c"],
    mime: "text/x-c",
    isExecutable: true,
    description: "Execution (Beta).",
    theme: {
      primary: "cyan",
      app_bg: "bg-black",
      app_gradient:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-cyan-500/20 via-cyan-950/80 to-black",
      panel_bg: "bg-cyan-950/30",
      panel_border: "border-cyan-500/20",
      text_primary: "text-white",
      text_secondary: "text-cyan-200",
      text_dim: "text-cyan-300/60",
      accent_ring: "ring-cyan-400",
      accent_hover: "hover:bg-cyan-500/20",
      button_bg: "bg-cyan-600",
      button_hover: "hover:bg-cyan-500",
      blob_color: "bg-cyan-600",
    },
  },
  {
    id: "javascript",
    name: "JavaScript",
    icon: FileJson,
    extensions: [".js", ".jsx", ".ts", ".tsx", ".mjs"],
    mime: "text/javascript",
    isExecutable: true,
    description: "Execution supported.",
    theme: {
      primary: "yellow",
      app_bg: "bg-black",
      app_gradient:
        "bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-yellow-950/80 to-black",
      panel_bg: "bg-yellow-950/30",
      panel_border: "border-yellow-500/20",
      text_primary: "text-white",
      text_secondary: "text-yellow-200",
      text_dim: "text-yellow-300/60",
      accent_ring: "ring-yellow-400",
      accent_hover: "hover:bg-yellow-500/20",
      button_bg: "bg-yellow-600",
      button_hover: "hover:bg-yellow-500",
      blob_color: "bg-yellow-600",
    },
  },
];

export const getLanguage = (id) =>
  languages.find((l) => l.id === id) || languages[0];
