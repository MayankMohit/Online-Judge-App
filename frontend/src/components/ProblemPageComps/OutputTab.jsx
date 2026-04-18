import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchCodeFeedback } from "../../features/ai/aiSlice";
import {
  CheckCircle, XCircle, Clock, AlertTriangle,
  Sparkles, Loader2, ThumbsUp, Lightbulb,
  Zap, MemoryStick, ChevronDown, ChevronUp, Star,
} from "lucide-react";

const LOADING_MESSAGES = [
  "Analysing your code...",
  "Detecting patterns...",
  "Calculating complexity...",
  "Generating feedback...",
  "Almost there...",
];

// ── Skeleton shown while feedback is loading ──────────────────────────────────
const FeedbackSkeleton = () => (
  <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden animate-pulse">
    {/* Header */}
    <div className="flex items-center justify-between px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="w-3 h-3 rounded bg-purple-500/30" />
        <div className="w-20 h-3 rounded bg-zinc-700" />
      </div>
      <div className="w-8 h-3 rounded bg-zinc-700" />
    </div>

    <div className="px-3 pb-3 flex flex-col gap-3 border-t border-purple-500/10 pt-3">
      {/* Badge row */}
      <div className="flex flex-wrap gap-2">
        <div className="h-6 w-28 rounded-lg bg-zinc-800" />
        <div className="h-6 w-20 rounded-lg bg-zinc-800" />
        <div className="h-6 w-16 rounded-lg bg-zinc-800" />
      </div>
      {/* Summary */}
      <div className="flex flex-col gap-1.5">
        <div className="h-2.5 rounded bg-zinc-800 w-full" />
        <div className="h-2.5 rounded bg-zinc-800 w-4/5" />
        <div className="h-2.5 rounded bg-zinc-800 w-3/5" />
      </div>
      {/* Strengths */}
      <div className="flex flex-col gap-1.5">
        <div className="h-2 rounded bg-zinc-800 w-16 mb-1" />
        <div className="h-2.5 rounded bg-zinc-800 w-full" />
        <div className="h-2.5 rounded bg-zinc-800 w-4/5" />
      </div>
      {/* Improvements */}
      <div className="flex flex-col gap-1.5">
        <div className="h-2 rounded bg-zinc-800 w-20 mb-1" />
        <div className="h-2.5 rounded bg-zinc-800 w-full" />
      </div>
      {/* Score bar */}
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between">
          <div className="h-2 rounded bg-zinc-800 w-16" />
          <div className="h-2 rounded bg-zinc-800 w-8" />
        </div>
        <div className="h-1.5 rounded-full bg-zinc-800 w-full" />
      </div>
    </div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const OutputTab = ({ verdict, failedCase, averageTime, lastAction, loading, onClose, submissionId }) => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [feedbackOpen, setFeedbackOpen] = useState(true);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showPatience, setShowPatience] = useState(false);

  const intervalRef = useRef(null);
  const msgIntervalRef = useRef(null);
  const patienceTimerRef = useRef(null);
  const dispatch = useDispatch();

  const { currentFeedback, feedbackLoading, feedbackError } = useSelector((state) => state.ai);

  // Submit progress bar
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

  // Rotating loading messages + patience note
  useEffect(() => {
    if (feedbackLoading) {
      setMsgIndex(0);
      setShowPatience(false);

      msgIntervalRef.current = setInterval(() => {
        setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
      }, 2000);

      patienceTimerRef.current = setTimeout(() => setShowPatience(true), 5000);

      return () => {
        clearInterval(msgIntervalRef.current);
        clearTimeout(patienceTimerRef.current);
      };
    } else {
      setShowPatience(false);
    }
  }, [feedbackLoading]);

  const verdictConfig = {
    accepted:            { label: "Accepted",           icon: <CheckCircle size={18} />,   cls: "text-green-400" },
    wrong_answer:        { label: "Wrong Answer",        icon: <XCircle size={18} />,       cls: "text-red-400" },
    time_limit_exceeded: { label: "Time Limit Exceeded", icon: <Clock size={18} />,         cls: "text-yellow-400" },
    compilation_error:   { label: "Compilation Error",   icon: <AlertTriangle size={18} />, cls: "text-orange-400" },
    runtime_error:       { label: "Runtime Error",       icon: <XCircle size={18} />,       cls: "text-pink-400" },
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

  const handleGetFeedback = () => {
    if (submissionId && !currentFeedback && !feedbackLoading) {
      dispatch(fetchCodeFeedback({ submissionId }));
    }
    setFeedbackOpen(true);
  };

  const scoreColor = (score) => {
    if (score >= 8) return "text-green-400";
    if (score >= 5) return "text-yellow-400";
    return "text-red-400";
  };

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

      {/* Verdict result */}
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

          {/* ── AI Feedback (Accepted only) ── */}
          {verdict === "accepted" && (
            <div className="flex flex-col gap-2">

              {/* Trigger button */}
              {!currentFeedback && !feedbackLoading && (
                <button
                  onClick={handleGetFeedback}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50 text-purple-400 text-xs font-medium transition"
                >
                  <Sparkles size={13} />
                  Get AI Feedback
                </button>
              )}

              {/* Loading — rotating message + patience + skeleton */}
              {feedbackLoading && (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-0.5">
                    <Loader2 size={12} className="animate-spin text-purple-400 shrink-0" />
                    <span className="text-xs text-purple-300 transition-all duration-500">
                      {LOADING_MESSAGES[msgIndex]}
                    </span>
                  </div>
                  {showPatience && (
                    <p className="text-[11px] text-zinc-500 italic px-0.5">
                      ⏳ This may take a few seconds, please be patient...
                    </p>
                  )}
                  <FeedbackSkeleton />
                </div>
              )}

              {/* Feedback card */}
              {currentFeedback && (
                <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 overflow-hidden">
                  <button
                    onClick={() => setFeedbackOpen((o) => !o)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-purple-500/10 transition"
                  >
                    <div className="flex items-center gap-2">
                      <Sparkles size={12} className="text-purple-400" />
                      <span className="text-xs font-semibold text-purple-300">AI Feedback</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-bold ${scoreColor(currentFeedback.score)}`}>
                        {currentFeedback.score}/10
                      </span>
                      {feedbackOpen
                        ? <ChevronUp size={13} className="text-zinc-500" />
                        : <ChevronDown size={13} className="text-zinc-500" />
                      }
                    </div>
                  </button>

                  {feedbackOpen && (
                    <div className="px-3 pb-3 flex flex-col gap-3 border-t border-purple-500/10">
                      {/* Approach + Complexity */}
                      <div className="flex flex-wrap gap-2 pt-3">
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                          <Zap size={11} className="text-yellow-400" />
                          <span className="text-[11px] text-zinc-300">{currentFeedback.approach}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                          <Clock size={11} className="text-blue-400" />
                          <span className="text-[11px] text-zinc-300">{currentFeedback.timeComplexity}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-800 border border-zinc-700">
                          <MemoryStick size={11} className="text-green-400" />
                          <span className="text-[11px] text-zinc-300">{currentFeedback.spaceComplexity}</span>
                        </div>
                      </div>

                      {/* Summary */}
                      <p className="text-zinc-400 text-xs leading-relaxed">{currentFeedback.summary}</p>

                      {/* Strengths */}
                      {currentFeedback.strengths?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <ThumbsUp size={11} className="text-green-400" />
                            <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Strengths</span>
                          </div>
                          <ul className="flex flex-col gap-1">
                            {currentFeedback.strengths.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                <span className="text-green-500 mt-0.5 shrink-0">✓</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Improvements */}
                      {currentFeedback.improvements?.length > 0 && (
                        <div>
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <Lightbulb size={11} className="text-yellow-400" />
                            <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider">Improvements</span>
                          </div>
                          <ul className="flex flex-col gap-1">
                            {currentFeedback.improvements.map((s, i) => (
                              <li key={i} className="flex items-start gap-1.5 text-[11px] text-zinc-300">
                                <span className="text-yellow-500 mt-0.5 shrink-0">→</span>
                                {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Score bar */}
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-1">
                            <Star size={11} className="text-purple-400" />
                            <span className="text-[11px] text-zinc-500">Overall Score</span>
                          </div>
                          <span className={`text-xs font-bold ${scoreColor(currentFeedback.score)}`}>
                            {currentFeedback.score}/10
                          </span>
                        </div>
                        <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-700"
                            style={{ width: `${(currentFeedback.score / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Error state with retry */}
              {feedbackError && !currentFeedback && !feedbackLoading && (
                <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-xs text-red-400 flex items-center gap-1.5">
                    <AlertTriangle size={11} /> {feedbackError}
                  </p>
                  <button
                    onClick={handleGetFeedback}
                    className="text-[11px] text-red-400 hover:text-red-300 underline shrink-0 transition"
                  >
                    Retry
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OutputTab;