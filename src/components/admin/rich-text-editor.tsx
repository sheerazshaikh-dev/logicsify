import { useCallback, useEffect, useRef, useState } from "react";

const RICH_TEXT_EDITOR_DOCUMENT = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    html, body { min-height: 100%; margin: 0; }
    body {
      padding: 16px;
      color: #190A2F;
      background: #fff;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 14px;
      line-height: 1.7;
      outline: none;
      overflow-wrap: anywhere;
    }
    body:empty::before { content: "Write content…"; color: #94a3b8; pointer-events: none; }
    p { margin: 0 0 1em; }
    h2 { margin: 1.4em 0 .55em; font-size: 1.75rem; line-height: 1.2; }
    h3 { margin: 1.25em 0 .5em; font-size: 1.35rem; line-height: 1.25; }
    ul, ol { margin: 0 0 1em; padding-left: 1.5rem; }
    blockquote { margin: 1em 0; padding-left: 1rem; border-left: 3px solid #FE3434; color: #64748b; }
    a { color: #FE3434; text-decoration: underline; }
  </style>
</head>
<body contenteditable="true"></body>
</html>`;

export function RichTextEditor({
  value,
  onChange,
  compact = false,
}: {
  value: string;
  onChange: (value: string) => void;
  compact?: boolean;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const lastEditorHtmlRef = useRef(value);
  const latestValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const savedRangeRef = useRef<Range | null>(null);
  const cleanupRef = useRef<(() => void) | null>(null);
  const [ready, setReady] = useState(false);

  latestValueRef.current = value;
  onChangeRef.current = onChange;

  const getEditor = useCallback(() => {
    const frame = iframeRef.current;
    const doc = frame?.contentDocument;
    const body = doc?.body;
    return doc && body ? { doc, body } : null;
  }, []);

  const emitChange = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const html = editor.body.innerHTML;
    lastEditorHtmlRef.current = html;
    onChangeRef.current(html);
  }, [getEditor]);

  const saveSelection = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.doc.getSelection();
    if (!selection?.rangeCount) return;
    const range = selection.getRangeAt(0);
    if (editor.body.contains(range.commonAncestorContainer)) {
      savedRangeRef.current = range.cloneRange();
    }
  }, [getEditor]);

  const restoreSelection = useCallback(() => {
    const editor = getEditor();
    if (!editor) return;
    const selection = editor.doc.getSelection();
    if (!selection) return;
    selection.removeAllRanges();
    if (
      savedRangeRef.current &&
      editor.body.contains(savedRangeRef.current.commonAncestorContainer)
    ) {
      selection.addRange(savedRangeRef.current);
      return;
    }
    const range = editor.doc.createRange();
    range.selectNodeContents(editor.body);
    range.collapse(false);
    selection.addRange(range);
  }, [getEditor]);

  const initializeEditor = useCallback(() => {
    cleanupRef.current?.();
    const editor = getEditor();
    if (!editor) return;

    const initialHtml = latestValueRef.current;
    editor.body.innerHTML = initialHtml;
    editor.body.contentEditable = "true";
    editor.body.spellcheck = true;
    lastEditorHtmlRef.current = initialHtml;

    const onInput = () => emitChange();
    const onBlur = () => emitChange();
    const onSelectionChange = () => saveSelection();

    editor.body.addEventListener("input", onInput);
    editor.body.addEventListener("blur", onBlur);
    editor.doc.addEventListener("selectionchange", onSelectionChange);

    cleanupRef.current = () => {
      editor.body.removeEventListener("input", onInput);
      editor.body.removeEventListener("blur", onBlur);
      editor.doc.removeEventListener("selectionchange", onSelectionChange);
    };
    setReady(true);
  }, [emitChange, getEditor, saveSelection]);

  useEffect(() => () => cleanupRef.current?.(), []);

  useEffect(() => {
    if (!ready || value === lastEditorHtmlRef.current) return;
    const editor = getEditor();
    if (!editor) return;
    if (editor.body.innerHTML !== value) editor.body.innerHTML = value;
    lastEditorHtmlRef.current = value;
  }, [getEditor, ready, value]);

  function command(name: string, argument?: string) {
    const editor = getEditor();
    if (!editor) return;

    let resolvedArgument = argument;
    if (name === "createLink") {
      const url = window.prompt("Enter the link URL", "https://");
      if (!url) return;
      resolvedArgument = url;
    }

    editor.body.focus();
    restoreSelection();
    editor.doc.execCommand(name, false, resolvedArgument);
    saveSelection();
    emitChange();
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-4 focus-within:ring-[#FE3434]/10">
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        {[
          { label: "B", cmd: "bold" },
          { label: "I", cmd: "italic" },
          { label: "H2", cmd: "formatBlock", arg: "h2" },
          { label: "H3", cmd: "formatBlock", arg: "h3" },
          { label: "• List", cmd: "insertUnorderedList" },
          { label: "1. List", cmd: "insertOrderedList" },
          { label: "Quote", cmd: "formatBlock", arg: "blockquote" },
          { label: "Link", cmd: "createLink" },
          { label: "Clear", cmd: "removeFormat" },
        ].map((item) => (
          <button
            key={item.label}
            type="button"
            onMouseDown={(event) => event.preventDefault()}
            onClick={() => command(item.cmd, item.arg)}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-[#190A2F] hover:bg-[#190A2F] hover:text-white"
          >
            {item.label}
          </button>
        ))}
      </div>
      <iframe
        ref={iframeRef}
        title="Rich text editor"
        srcDoc={RICH_TEXT_EDITOR_DOCUMENT}
        onLoad={initializeEditor}
        className={`block w-full border-0 bg-white ${compact ? "h-44" : "h-[22rem]"}`}
      />
    </div>
  );
}
