"use client";

import Prism from "prismjs";
import "prismjs/components/prism-clike";
import "prismjs/components/prism-javascript";
import "prismjs/components/prism-typescript";
import Editor from "react-simple-code-editor";

export type EditorLanguage = "js" | "ts";

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: EditorLanguage;
  disabled?: boolean;
  placeholder?: string;
}

const GRAMMARS: Record<EditorLanguage, { grammar: Prism.Grammar; name: string }> =
  {
    js: { grammar: Prism.languages.javascript, name: "javascript" },
    ts: { grammar: Prism.languages.typescript, name: "typescript" },
  };

/**
 * Syntax-highlighted code editor built on react-simple-code-editor + Prism.
 * Bundled (no CDN / web workers), so it renders reliably server- and
 * client-side. Highlighting follows the selected language.
 */
export function CodeEditor({
  value,
  onChange,
  language = "js",
  disabled = false,
  placeholder,
}: CodeEditorProps) {
  const { grammar, name } = GRAMMARS[language];

  return (
    <div className="h-96 w-full overflow-auto rounded-lg border border-slate-700 bg-slate-950 focus-within:border-purple-500">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => Prism.highlight(code, grammar, name)}
        disabled={disabled}
        placeholder={placeholder}
        padding={16}
        textareaClassName="focus:outline-none"
        className="min-h-full font-mono text-sm text-slate-100"
        style={{
          fontFamily:
            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
          fontSize: 13,
          lineHeight: 1.6,
        }}
      />
    </div>
  );
}
