import { useEffect, useState, useRef } from "react";
import { CheckCircle, XCircle, Clock, AlertTriangle } from "lucide-react";

/**
 * OutputTab — only shows SUBMIT results now.
 * Run results are shown in TestCasePanel.
 */
const OutputTab = ({ verdict, failedCase, averageTime, lastAction, loading, onClose }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (lastAction === "submit" && loading) {
      setProgress(0);
      setFadeOut(false);
      intervalRef.current = setInterval(() => {
        setProgress((p) => p < 80 ? Math.min(p + 5, 80) : Math.min(p + 2, 95));
      }, 100);
      return () => clearInterval(intervalRef.current);
    }
    if (!loading && lastAction === "submit") {
      clearInterval(intervalRef.current);
      setProgress(100);
      const t = setTimeout(() => setFadeOut(true), 1000);
      return () => clearTimeout(t);
    }
  }, [loading, lastAction]);

  const verdictConfig = {
    accepted:            { label: "Accepted",           icon: <CheckCircle size={18} />, cls: "text-green-400" },
    wrong_answer:        { label: "Wrong Answer",        icon: <XCircle size={18} />,     cls: "text-red-400" },
    time_limit_exceeded: { label: "Time Limit Exceeded", icon: <Clock size={18} />,       cls: "text-yellow-400" },
    compilation_error:   { label: "Compilation Error",   icon: <AlertTriangle size={18} />,cls: "text-orange-400" },
    runtime_error:       { label: "Runtime Error",       icon: <XCircle size={18} />,     cls: "text-pink-400" },
  };

  const vc = verdictConfig[verdict];

  const codeBox = (content, colorClass = "text-zinc-300") => (
    <pre className={`bg-black/50 border border-zinc-800 rounded-lg p-2.5 text-xs font-mono whitespace-pre-wrap overflow-auto max-h-28 custom-scrollbar ${colorClass}`}>
      {content}
    </pre>
  );

  const Label = ({ text }) => (
    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1">{text}</p>
  );

  return (
    <div className="bg-zinc-950 p-4 text-sm flex flex-col gap-3 h-full overflow-auto custom-scrollbar">
      <div className="flex justify-between items-center shrink-0">
        <h3 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Submit Result</h3>
        {onClose && (
          <button onClick={onClose} className="text-zinc-600 hover:text-zinc-300 text-xs transition">✕</button>
        )}
      </div>

      {/* Progress bar while submitting */}
      {lastAction === "submit" && loading && (
        <div>
          <p className="text-zinc-500 text-xs italic mb-2">Evaluating against all test cases...</p>
          <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-purple-500 rounded-full transition-all duration-300 shimmer-bar ${fadeOut ? "opacity-0" : "opacity-100"}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Result */}
      {lastAction === "submit" && !loading && vc && (
        <div className="flex flex-col gap-3">
          <div className={`flex items-center gap-2 font-bold text-lg ${vc.cls}`}>
            {vc.icon}{vc.label}
          </div>

          {verdict === "compilation_error" && (
            <div><Label text="Error" />{codeBox(failedCase?.actualOutput || "Compilation failed.", "text-red-400")}</div>
          )}
          {verdict === "wrong_answer" && (
            <div className="flex flex-col gap-2">
              <div><Label text="Input" />{codeBox(failedCase?.input || "N/A")}</div>
              <div><Label text="Expected" />{codeBox(failedCase?.expectedOutput || "N/A", "text-green-400")}</div>
              <div><Label text="Got" />{codeBox(failedCase?.actualOutput || "No output", "text-red-400")}</div>
            </div>
          )}
          {verdict === "time_limit_exceeded" && (
            <p className="text-xs text-zinc-500">Your solution exceeded the 3-second time limit.</p>
          )}
          {verdict === "runtime_error" && (
            <div><Label text="Error" />{codeBox(failedCase?.actualOutput || "Runtime error occurred.", "text-pink-400")}</div>
          )}
          {verdict === "accepted" && (
            <p className="text-xs text-zinc-500">All test cases passed ✓ &nbsp;Avg: {averageTime}ms</p>
          )}
        </div>
      )}
    </div>
  );
};

export default OutputTab;