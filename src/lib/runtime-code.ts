import type { CodeSnippet } from "@/lib/logicsify-api";

const RUNTIME_ATTRIBUTE = "data-logicsify-runtime";

function executableNode(node: Node): Node {
  if (!(node instanceof HTMLScriptElement)) return node.cloneNode(true);

  const script = document.createElement("script");
  Array.from(node.attributes).forEach((attribute) => {
    script.setAttribute(attribute.name, attribute.value);
  });
  script.text = node.text;
  return script;
}

function runtimeNodes(key: string) {
  return Array.from(document.querySelectorAll<HTMLElement>(`[${RUNTIME_ATTRIBUTE}]`)).filter(
    (node) => node.getAttribute(RUNTIME_ATTRIBUTE) === key,
  );
}

export function removeRuntimeNodes(key: string) {
  runtimeNodes(key).forEach((node) => node.remove());
}

export function removeRuntimeNamespace(namespace: string) {
  Array.from(document.querySelectorAll<HTMLElement>(`[${RUNTIME_ATTRIBUTE}]`))
    .filter((node) => (node.getAttribute(RUNTIME_ATTRIBUTE) || "").startsWith(namespace))
    .forEach((node) => node.remove());
}

export function injectRuntimeStyle(key: string, css: string | undefined) {
  removeRuntimeNodes(key);
  if (!css?.trim()) return;

  const style = document.createElement("style");
  style.setAttribute(RUNTIME_ATTRIBUTE, key);
  style.textContent = css;
  document.head.appendChild(style);
}

export function injectCodeSnippet(snippet: CodeSnippet, namespace: string) {
  const key = `${namespace}-${snippet.id}`;
  removeRuntimeNodes(key);
  if (!snippet.enabled || !snippet.code.trim()) return;

  const template = document.createElement("template");
  template.innerHTML = snippet.code;
  const nodes = Array.from(template.content.childNodes).map((node) => {
    const executable = executableNode(node);
    if (executable instanceof HTMLElement) executable.setAttribute(RUNTIME_ATTRIBUTE, key);
    return executable;
  });

  if (snippet.placement === "head") {
    nodes.forEach((node) => document.head.appendChild(node));
    return;
  }

  if (snippet.placement === "body_start") {
    const anchor = document.body.firstChild;
    nodes.forEach((node) => document.body.insertBefore(node, anchor));
    return;
  }

  nodes.forEach((node) => document.body.appendChild(node));
}

export function injectCodeSnippets(
  snippets: CodeSnippet[] | undefined,
  target: "public" | "admin",
  namespace: string,
) {
  const ordered = [...(snippets || [])]
    .filter((snippet) => snippet.enabled && (snippet.target === target || snippet.target === "both"))
    .sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));

  const bodyStart = ordered.filter((snippet) => snippet.placement === "body_start").reverse();
  const remaining = ordered.filter((snippet) => snippet.placement !== "body_start");

  bodyStart.forEach((snippet) => injectCodeSnippet(snippet, namespace));
  remaining.forEach((snippet) => injectCodeSnippet(snippet, namespace));
}
