import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { javascript } from "@codemirror/lang-javascript";
import { editorExtensions } from "./editorTheme";

const languageExtension = (language) => {
  switch (language) {
    case "cpp":
    case "c":
      return [cpp()];
    case "py":
    case "python":
      return [python()];
    case "js":
    case "javascript":
      return [javascript()];
    default:
      return [];
  }
};

// Read-only CodeMirror viewer for displaying submitted code.
const CodeViewer = ({ value, language }) => (
  <CodeMirror
    value={value}
    height="100%"
    theme="none"
    editable={false}
    extensions={[
      EditorView.lineWrapping,
      EditorState.readOnly.of(true),
      ...editorExtensions,
      ...languageExtension(language),
    ]}
    style={{ height: "100%" }}
  />
);

export default CodeViewer;
