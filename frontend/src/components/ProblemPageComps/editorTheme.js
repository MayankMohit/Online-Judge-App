import { EditorView } from "@codemirror/view";
import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { tags as t } from "@lezer/highlight";

// Custom CodeMirror theme tuned to the app's near-black zinc palette
// (bg-zinc-950 / zinc-900 surfaces, purple-500 accent), so the editor
// blends with the surrounding UI instead of the bluish default one-dark.
const bg = "#0e0e10"; // editor background
const surface = "#18181b"; // zinc-900
const fg = "#e4e4e7"; // zinc-200
const subtle = "#52525b"; // zinc-600
const purple = "#a855f7"; // purple-500
const selection = "#a855f733";

const baseTheme = EditorView.theme(
  {
    "&": { color: fg, backgroundColor: bg, height: "100%" },
    ".cm-content": {
      caretColor: purple,
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      fontSize: "13px",
      // Allow native (touch) text selection on mobile — without these the
      // surrounding swipe/scroll layout can swallow the selection gesture.
      WebkitUserSelect: "text",
      userSelect: "text",
      WebkitTouchCallout: "default",
    },
    ".cm-scroller": {
      fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
      lineHeight: "1.6",
      // Let the editor own vertical panning so touch selection isn't hijacked
      touchAction: "pan-y",
    },
    ".cm-line": { WebkitUserSelect: "text", userSelect: "text" },
    ".cm-cursor, .cm-dropCursor": { borderLeftColor: purple },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground, .cm-content ::selection":
      { backgroundColor: selection },
    ".cm-activeLine": { backgroundColor: "#ffffff08" },
    ".cm-gutters": { backgroundColor: bg, color: subtle, border: "none" },
    ".cm-activeLineGutter": { backgroundColor: "#ffffff08", color: fg },
    ".cm-lineNumbers .cm-gutterElement": { padding: "0 8px 0 6px" },
    ".cm-foldPlaceholder": { backgroundColor: surface, border: "none", color: subtle },
    ".cm-matchingBracket, &.cm-focused .cm-matchingBracket": {
      backgroundColor: selection,
      outline: "1px solid #a855f755",
    },
    ".cm-selectionMatch": { backgroundColor: "#ffffff14" },
    ".cm-tooltip": {
      backgroundColor: surface,
      border: "1px solid #27272a",
      color: fg,
    },
    ".cm-tooltip-autocomplete > ul > li[aria-selected]": {
      backgroundColor: "#a855f733",
      color: fg,
    },
  },
  { dark: true }
);

const highlightStyle = HighlightStyle.define([
  { tag: [t.comment, t.lineComment, t.blockComment, t.docComment], color: "#6b7280", fontStyle: "italic" },
  { tag: [t.keyword, t.modifier, t.controlKeyword, t.operatorKeyword, t.definitionKeyword], color: "#c792ea" },
  { tag: [t.string, t.special(t.string), t.character], color: "#c3e88d" },
  { tag: [t.number, t.bool, t.null, t.atom], color: "#f78c6c" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: "#82aaff" },
  { tag: [t.typeName, t.className, t.namespace, t.definition(t.typeName)], color: "#ffcb6b" },
  { tag: [t.propertyName, t.attributeName], color: "#82aaff" },
  { tag: [t.variableName, t.definition(t.variableName), t.labelName], color: fg },
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: "#89ddff" },
  { tag: [t.punctuation, t.separator, t.bracket, t.brace, t.paren], color: "#9ca3af" },
  { tag: [t.meta, t.processingInstruction], color: "#a855f7" }, // preprocessor (#include)
  { tag: [t.self, t.constant(t.name)], color: "#f78c6c" },
  { tag: t.invalid, color: "#ff5370" },
]);

// Combined extensions to pass to a CodeMirror instance.
export const editorExtensions = [baseTheme, syntaxHighlighting(highlightStyle)];
