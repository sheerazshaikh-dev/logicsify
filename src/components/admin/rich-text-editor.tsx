import { useCallback, useEffect, useRef, useState } from "react";

const RICH_TEXT_EDITOR_DOCUMENT = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    * { box-sizing: border-box; }
    html, body { min-height: 100%; margin: 0; }
    :root {
      --editor-text: #000000;
      --editor-background: #FFFFFF;
      --editor-muted: #64748B;
      --editor-border: color-mix(in oklab, var(--theme-dark) 12%, transparent);
      --editor-accent: #04A6A1;
      --editor-accent-end: #8BCF3C;
      --editor-heading-font: Sora, ui-sans-serif, system-ui, sans-serif;
      --editor-body-font: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    }
    body {
      padding: 16px;
      color: var(--editor-text);
      background: var(--editor-background);
      font-family: var(--editor-body-font);
      font-size: 14px;
      line-height: 1.7;
      outline: none;
      overflow-wrap: anywhere;
    }
    body:empty::before { content: "Write content…"; color: #94a3b8; pointer-events: none; }
    p { margin: 0 0 1em; }
    h2 {
      position: relative;
      margin: 2em 0 .7em;
      padding-bottom: .65em;
      border-bottom: 1px solid var(--editor-border);
      font-size: 2rem;
      line-height: 1.18;
      letter-spacing: -.035em;
    }
    h2::after {
      position: absolute;
      bottom: -1px;
      left: 0;
      width: 56px;
      height: 3px;
      border-radius: 999px;
      background: linear-gradient(135deg, var(--editor-accent), var(--editor-accent-end));
      content: "";
    }
    h2, h3 { font-family: var(--editor-heading-font); }
    h3 {
      margin: 1.65em 0 .55em;
      font-size: 1.45rem;
      line-height: 1.28;
      letter-spacing: -.02em;
    }
    ul, ol { margin: 0 0 1em; padding-left: 1.5rem; }
    blockquote { margin: 1em 0; padding-left: 1rem; border-left: 3px solid var(--editor-accent); color: var(--editor-muted); }
    a { color: var(--editor-accent); text-decoration: underline; }
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

    const theme = getComputedStyle(document.documentElement);
    const editorRoot = editor.doc.documentElement;
    const themeValue = (name: string, fallback: string) => theme.getPropertyValue(name).trim() || fallback;
    editorRoot.style.setProperty("--editor-text", themeValue("--theme-text", "#000000"));
    editorRoot.style.setProperty("--editor-background", themeValue("--theme-background", "#FFFFFF"));
    editorRoot.style.setProperty("--editor-muted", themeValue("--theme-muted-text", "#64748B"));
    editorRoot.style.setProperty("--editor-border", themeValue("--theme-border", "#E6E1EA"));
    editorRoot.style.setProperty("--editor-accent", themeValue("--theme-primary-start", "#04A6A1"));
    editorRoot.style.setProperty("--editor-accent-end", themeValue("--theme-primary-end", "#8BCF3C"));
    editorRoot.style.setProperty("--editor-heading-font", themeValue("--theme-heading-font", "Sora, system-ui, sans-serif"));
    editorRoot.style.setProperty("--editor-body-font", themeValue("--theme-body-font", "Inter, system-ui, sans-serif"));

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
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:ring-4 focus-within:ring-brand-red/10">
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
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-ink hover:bg-ink hover:text-white"
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
