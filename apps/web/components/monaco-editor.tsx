"use client";

import Editor, { loader } from "@monaco-editor/react";

// Load Monaco from our own origin (see scripts/copy-monaco.mjs) rather than the
// default jsDelivr CDN — reliable, offline-capable, no third-party dependency.
loader.config({ paths: { vs: "/monaco/vs" } });

export type EditorLanguage = "js" | "ts";

interface MonacoCodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: EditorLanguage;
  disabled?: boolean;
}

/**
 * Monaco (the editor that powers VS Code) as the playground's code surface.
 * @monaco-editor/react handles SSR by rendering the `loading` fallback on the
 * server and mounting the real editor on the client.
 */
export function MonacoCodeEditor({
  value,
  onChange,
  language = "js",
  disabled = false,
}: MonacoCodeEditorProps) {
  return (
    <div className="h-96 overflow-hidden rounded-lg border border-slate-700 bg-[#1e1e1e]">
      <Editor
        height="100%"
        theme="vs-dark"
        language={language === "ts" ? "typescript" : "javascript"}
        value={value}
        onChange={(next) => onChange(next ?? "")}
        loading={
          <div className="p-4 font-mono text-sm text-slate-500">
            Loading editor…
          </div>
        }
        options={{
          readOnly: disabled,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          tabSize: 2,
          padding: { top: 12, bottom: 12 },
          smoothScrolling: true,
          automaticLayout: true,
        }}
      />
    </div>
  );
}
