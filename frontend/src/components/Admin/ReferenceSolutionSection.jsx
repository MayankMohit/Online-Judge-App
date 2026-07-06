import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-hot-toast";
import CodeMirror from "@uiw/react-codemirror";
import { EditorView } from "@codemirror/view";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Wand2 } from "lucide-react";

import { validateTestCases } from "../../features/problems/problemMutationSlice";
import { editorExtensions } from "../ProblemPageComps/editorTheme";

const LANGUAGES = [
  { value: "cpp", label: "C++" },
  { value: "c", label: "C" },
  { value: "python", label: "Python" },
];

// Only modes the compiler actually implements today (Phase 4 adds the rest).
const COMPARISON_MODES = [
  { value: "trimmed", label: "Trimmed (ignore trailing whitespace)" },
  { value: "exact", label: "Exact match" },
];

const langExtension = (language) => {
  switch (language) {
    case "cpp":
    case "c":
      return [cpp()];
    case "python":
      return [python()];
    default:
      return [];
  }
};

/**
 * Admin reference-solution + test-case validation panel.
 *
 * The admin supplies a trusted solution; "Validate" runs it against every test
 * case via the compiler. In "generate" mode the expected outputs are produced
 * from the reference and can be applied back into the form.
 */
export default function ReferenceSolutionSection({
  reference,
  setReference,
  testCases,
  onApplyGenerated,
}) {
  const dispatch = useDispatch();
  const [validating, setValidating] = useState(false);
  const [result, setResult] = useState(null);

  const update = (patch) => setReference((prev) => ({ ...prev, ...patch }));

  const generate = reference.validationMode === "generate";

  const handleValidate = async () => {
    if (!reference.code?.trim()) {
      toast.error("Write a reference solution first");
      return;
    }
    if (!testCases?.length) {
      toast.error("Add at least one test case");
      return;
    }

    setValidating(true);
    setResult(null);
    try {
      const validation = await dispatch(
        validateTestCases({
          referenceCode: reference.code,
          referenceLanguage: reference.language,
          testCases: testCases.map(({ input, expectedOutput, isHidden }) => ({
            input,
            expectedOutput,
            isHidden,
          })),
          comparisonMode: reference.comparisonMode,
          validationMode: reference.validationMode,
        })
      ).unwrap();

      setResult(validation);
      if (validation.ok) {
        toast.success(validation.message);
        if (generate && validation.updatedTestCases) {
          onApplyGenerated?.(validation.updatedTestCases);
        }
      } else {
        toast.error(validation.message);
      }
    } catch (err) {
      toast.error(typeof err === "string" ? err : "Validation failed");
    } finally {
      setValidating(false);
    }
  };

  const passedCount = result?.cases?.filter((c) => c.passed).length ?? 0;
  const totalCount = result?.cases?.length ?? 0;

  return (
    <div className="border border-zinc-800 rounded-2xl bg-zinc-900/60 p-3 sm:p-4 space-y-3">
      <div className="flex items-center gap-2">
        <ShieldCheck size={16} className="text-purple-400" />
        <h3 className="text-sm font-semibold text-white">
          Reference Solution &amp; Test-Case Validation
        </h3>
      </div>
      <p className="text-xs text-zinc-400">
        Test cases are validated against this trusted solution before the problem is
        saved. Choose <strong>Validate</strong> to check your expected outputs, or{" "}
        <strong>Generate</strong> to auto-fill them from the reference.
      </p>

      <div className="flex flex-wrap gap-2">
        <select
          value={reference.language}
          onChange={(e) => update({ language: e.target.value })}
          className="bg-zinc-800 border border-zinc-700 text-white px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-purple-500"
        >
          {LANGUAGES.map((l) => (
            <option key={l.value} value={l.value}>
              {l.label}
            </option>
          ))}
        </select>

        <select
          value={reference.comparisonMode}
          onChange={(e) => update({ comparisonMode: e.target.value })}
          className="bg-zinc-800 border border-zinc-700 text-white px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-purple-500"
        >
          {COMPARISON_MODES.map((m) => (
            <option key={m.value} value={m.value}>
              {m.label}
            </option>
          ))}
        </select>

        <select
          value={reference.validationMode}
          onChange={(e) => update({ validationMode: e.target.value })}
          className="bg-zinc-800 border border-zinc-700 text-white px-2.5 py-1.5 rounded-lg text-xs focus:outline-none focus:border-purple-500"
        >
          <option value="validate">Validate my expected outputs</option>
          <option value="generate">Generate expected outputs</option>
        </select>
      </div>

      <div className="rounded-lg overflow-hidden border border-zinc-800">
        <CodeMirror
          value={reference.code}
          height="220px"
          theme="none"
          extensions={[EditorView.lineWrapping, ...editorExtensions, ...langExtension(reference.language)]}
          onChange={(val) => update({ code: val })}
          basicSetup={{ tabSize: 2 }}
        />
      </div>

      <button
        type="button"
        onClick={handleValidate}
        disabled={validating}
        className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-3.5 py-2 rounded-lg text-xs font-medium transition"
      >
        {validating ? (
          <Loader2 size={14} className="animate-spin" />
        ) : generate ? (
          <Wand2 size={14} />
        ) : (
          <ShieldCheck size={14} />
        )}
        {validating
          ? "Running reference…"
          : generate
            ? "Generate & Validate"
            : "Validate Test Cases"}
      </button>

      {result && (
        <div className="space-y-2">
          {result.compileError ? (
            <div className="rounded-lg bg-red-500/10 border border-red-500/30 p-2.5">
              <p className="text-xs font-semibold text-red-400 mb-1">
                Reference failed to compile
              </p>
              <pre className="text-[11px] text-red-300 whitespace-pre-wrap font-mono">
                {result.compileError}
              </pre>
            </div>
          ) : (
            <>
              <div
                className={`flex items-center gap-2 text-xs font-medium ${
                  result.ok ? "text-green-400" : "text-red-400"
                }`}
              >
                {result.ok ? <CheckCircle2 size={14} /> : <XCircle size={14} />}
                {passedCount}/{totalCount} test cases passed
              </div>

              <div className="space-y-1.5 max-h-64 overflow-y-auto">
                {result.cases.map((c) => (
                  <div
                    key={c.index}
                    className={`rounded-lg border p-2 text-[11px] ${
                      c.passed
                        ? "border-green-500/20 bg-green-500/5"
                        : "border-red-500/30 bg-red-500/10"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {c.passed ? (
                        <CheckCircle2 size={12} className="text-green-400" />
                      ) : (
                        <XCircle size={12} className="text-red-400" />
                      )}
                      <span className="text-zinc-300 font-medium">
                        Case #{c.index + 1}
                        {c.isHidden && (
                          <span className="ml-1 text-zinc-500">(hidden)</span>
                        )}
                      </span>
                      {!c.passed && c.status !== "OK" && (
                        <span className="ml-auto text-red-400">{c.status}</span>
                      )}
                    </div>
                    {!c.passed && (
                      <div className="grid grid-cols-1 gap-1 font-mono text-zinc-400">
                        {c.error ? (
                          <pre className="whitespace-pre-wrap text-red-300">
                            {c.error}
                          </pre>
                        ) : (
                          <>
                            <div>
                              <span className="text-zinc-500">expected: </span>
                              {c.expected}
                            </div>
                            <div>
                              <span className="text-zinc-500">got: </span>
                              {c.actual}
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
