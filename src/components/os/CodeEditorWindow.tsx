import React, { useEffect, useRef } from "react";

const CodeEditorWindow: React.FC<{ onClose: () => void }> = () => {
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let editor: any;
    import("monaco-editor").then((monaco) => {
      editor = monaco.editor.create(editorRef.current!, {
        value: "// Welcome to GenieOS Code Editor!\n",
        language: "typescript",
        theme: "vs-dark",
        fontSize: 15,
        fontFamily: "Fira Mono, Menlo, monospace",
        automaticLayout: true,
        minimap: { enabled: false },
      });
    });
    return () => {
      if (editor) editor.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full bg-neutral-900 rounded-b-2xl overflow-hidden flex flex-col">
      <div ref={editorRef} className="flex-1 w-full h-full" />
    </div>
  );
};

export default CodeEditorWindow;