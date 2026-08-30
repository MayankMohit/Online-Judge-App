import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { EditorState } from "@codemirror/state";
import { editorExtensions } from "./editorTheme";
import { languageExtension } from "../../utils/languages";

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
