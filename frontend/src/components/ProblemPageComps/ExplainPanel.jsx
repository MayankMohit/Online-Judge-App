import { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchExplanation } from "../../features/ai/aiSlice";
import {
  Sparkles, Loader2, ChevronDown, ChevronUp,
  Globe, Lightbulb, BookOpen, Zap, AlertTriangle,
} from "lucide-react";

const LANGUAGES = [
  { code: "english",    label: "English",    flag: "🇬🇧" },
  { code: "hindi",      label: "हिंदी",       flag: "🇮🇳" },
  { code: "spanish",    label: "Español",    flag: "🇪🇸" },
  { code: "french",     label: "Français",   flag: "🇫🇷" },
  { code: "german",     label: "Deutsch",    flag: "🇩🇪" },
  { code: "japanese",   label: "日本語",      flag: "🇯🇵" },
  { code: "chinese",    label: "中文",        flag: "🇨🇳" },
  { code: "portuguese", label: "Português",  flag: "🇧🇷" },
  { code: "arabic",     label: "العربية",    flag: "🇸🇦" },
  { code: "bengali",    label: "বাংলা",       flag: "🇧🇩" },
];

const LOADING_MESSAGES = [
  "Understanding the problem...",
  "Crafting an analogy...",
  "Simplifying concepts...",
  "Writing explanation...",
  "Almost ready...",
];

const ExplanationSkeleton = () => (
  <div className="flex flex-col gap-2.5 animate-pulse mt-3">
    {[["🟡", "w-16"], ["🔵", "w-20"], ["🟣", "w-20"]].map(([, w], i) => (
      <div key={i} className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-3 flex flex-col gap-2">
        <div className={`h-2 ${w} rounded bg-zinc-700`} />
        <div className="h-2.5 w-full rounded bg-zinc-800" />
        <div className="h-2.5 w-4/5 rounded bg-zinc-800" />
      </div>
    ))}
  </div>
);

const ExplainPanel = ({ problem, isGuest }) => {
  const dispatch = useDispatch();
  const problemId = problem?._id;

  const { explanations, explanationLoading, explanationError, fetchingLanguage } = useSelector((s) => s.ai);

  const [selectedLang, setSelectedLang] = useState("english");
  const [isOpen, setIsOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [msgIndex, setMsgIndex] = useState(0);
  const [showPatience, setShowPatience] = useState(false);

  const msgIntervalRef = useRef(null);
  const patienceRef = useRef(null);
  const dropdownRef = useRef(null);

  const currentExplanation = explanations[problemId]?.[selectedLang] || null;
  const isCurrentlyFetching = explanationLoading && fetchingLanguage === selectedLang;
  const selectedLangConfig = LANGUAGES.find((l) => l.code === selectedLang);

  // Close dropdown on outside click — without blocking scroll
  useEffect(() => {
    if (!langMenuOpen) return;
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setLangMenuOpen(false);
      }
    };
    // Use capture:false so scroll events are unaffected
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [langMenuOpen]);

  const startLoadingMessages = () => {
    setMsgIndex(0);
    setShowPatience(false);
    clearInterval(msgIntervalRef.current);
    clearTimeout(patienceRef.current);
    msgIntervalRef.current = setInterval(() => {
      setMsgIndex((i) => Math.min(i + 1, LOADING_MESSAGES.length - 1));
    }, 2000);
    patienceRef.current = setTimeout(() => setShowPatience(true), 6000);
  };

  const stopLoadingMessages = () => {
    clearInterval(msgIntervalRef.current);
    clearTimeout(patienceRef.current);
    setShowPatience(false);
  };

  const handleGenerate = () => {
    if (!problemId || isCurrentlyFetching || isGuest) return;
    if (currentExplanation) { setIsOpen(true); return; }
    startLoadingMessages();
    dispatch(fetchExplanation({ problemId, language: selectedLang })).then(() => {
      stopLoadingMessages();
      setIsOpen(true);
    });
  };

  const handleLangChange = (code) => {
    setSelectedLang(code);
    setLangMenuOpen(false);
    setIsOpen(!!explanations[problemId]?.[code]);
  };

  return (
    <div className="mt-6 border-t border-zinc-800 pt-5">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-3">
        <Sparkles size={13} className="text-purple-400" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Explain in Simple Terms</span>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">

        {/* Language selector — opens UPWARD */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangMenuOpen((o) => !o)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 hover:border-zinc-600 text-zinc-300 text-xs transition"
          >
            <Globe size={11} className="text-zinc-500" />
            <span>{selectedLangConfig?.flag} {selectedLangConfig?.label}</span>
            {langMenuOpen
              ? <ChevronUp size={11} className="text-zinc-500" />
              : <ChevronDown size={11} className="text-zinc-500" />
            }
          </button>

          {langMenuOpen && (
            // bottom-full = opens above the button, no scroll blocking
            <div className="absolute bottom-full mb-1 left-0 z-30 w-44 bg-zinc-900 border border-zinc-700 rounded-xl shadow-xl overflow-hidden">
              {LANGUAGES.map(({ code, label, flag }) => (
                <button
                  key={code}
                  // onMouseDown + preventDefault so the parent scroll container
                  // doesn't lose focus, then handle selection in onClick
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleLangChange(code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-xs transition
                    ${selectedLang === code ? "bg-purple-600/20 text-purple-300" : "text-zinc-300 hover:bg-zinc-800"}`}
                >
                  <span>{flag}</span>
                  <span>{label}</span>
                  {explanations[problemId]?.[code] && (
                    <span className="ml-auto text-[10px] text-purple-400">✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Action button */}
        <button
          onClick={currentExplanation ? () => setIsOpen((o) => !o) : handleGenerate}
          disabled={isCurrentlyFetching || isGuest}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition
            disabled:opacity-50 disabled:pointer-events-none
            ${currentExplanation
              ? "bg-zinc-800 border border-zinc-700 text-zinc-300 hover:border-zinc-600"
              : "bg-purple-600 hover:bg-purple-700 text-white"
            }`}
        >
          {isCurrentlyFetching
            ? <Loader2 size={12} className="animate-spin" />
            : <Sparkles size={12} />
          }
          {currentExplanation
            ? isOpen ? "Hide" : "Show"
            : isCurrentlyFetching ? "Generating..." : "Explain"
          }
        </button>

        {isGuest && (
          <span className="text-[11px] text-zinc-600 italic">Sign in to use</span>
        )}
      </div>

      {/* Loading */}
      {isCurrentlyFetching && (
        <div className="flex flex-col gap-1.5 mt-3">
          <div className="flex items-center gap-2">
            <Loader2 size={12} className="animate-spin text-purple-400 shrink-0" />
            <span className="text-xs text-purple-300 transition-all duration-500">
              {LOADING_MESSAGES[msgIndex]}
            </span>
          </div>
          {showPatience && (
            <p className="text-[11px] text-zinc-500 italic">
              ⏳ This may take a few seconds, please be patient...
            </p>
          )}
          <ExplanationSkeleton />
        </div>
      )}

      {/* Error */}
      {explanationError && !currentExplanation && !isCurrentlyFetching && (
        <div className="flex items-center justify-between gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg mt-3">
          <p className="text-xs text-red-400 flex items-center gap-1.5">
            <AlertTriangle size={11} /> The AI model is currently experiencing high demand—please try again in a few seconds.
          </p>
          <button onClick={handleGenerate} className="text-[11px] text-red-400 hover:text-red-300 underline shrink-0 transition">
            Retry
          </button>
        </div>
      )}

      {/* Explanation content */}
      {currentExplanation && isOpen && (
        <div className="flex flex-col gap-2.5 mt-3">

          {/* Analogy */}
          <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Lightbulb size={12} className="text-yellow-400" />
              <span className="text-[11px] font-semibold text-yellow-400 uppercase tracking-wider">Real-World Analogy</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{currentExplanation.analogy}</p>
          </div>

          {/* Breakdown */}
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-2.5">
              <BookOpen size={12} className="text-blue-400" />
              <span className="text-[11px] font-semibold text-blue-400 uppercase tracking-wider">Step-by-Step Breakdown</span>
            </div>
            <div className="flex flex-col gap-2">
              {currentExplanation.breakdown?.map((step, i) => (
                <div key={i} className="flex gap-2.5 items-start">
                  <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0 mt-0.5">
                    <span className="text-[10px] font-bold text-blue-400">{i + 1}</span>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{step}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Key insight */}
          <div className="rounded-xl border border-purple-500/20 bg-purple-500/5 p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Zap size={12} className="text-purple-400" />
              <span className="text-[11px] font-semibold text-purple-400 uppercase tracking-wider">Key Insight</span>
            </div>
            <p className="text-zinc-300 text-xs leading-relaxed">{currentExplanation.keyInsight}</p>
          </div>

          {/* Example walkthrough */}
          {currentExplanation.example && (
            <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="text-green-400 text-[11px]">💡</span>
                <span className="text-[11px] font-semibold text-green-400 uppercase tracking-wider">Example Walkthrough</span>
              </div>
              <p className="text-zinc-300 text-xs leading-relaxed">{currentExplanation.example}</p>
            </div>
          )}

          {/* Language footer */}
          <div className="flex items-center gap-1.5 px-0.5 mt-0.5">
            <Globe size={11} className="text-zinc-600" />
            <span className="text-[11px] text-zinc-600">
              {selectedLangConfig?.flag} {selectedLangConfig?.label}
              {" · "}
              <button
                onClick={() => setLangMenuOpen(true)}
                className="text-purple-500 hover:text-purple-400 underline transition"
              >
                Switch language
              </button>
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExplainPanel;