import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHint, fetchUnlockedTiers } from "../../features/ai/aiSlice";
import { Sparkles, ChevronDown, ChevronUp, Lock, Loader2, AlertCircle, Lightbulb, Brain, Code2 } from "lucide-react";

const TIERS = [
  {
    tier: 1,
    label: "Nudge",
    sublabel: "A gentle push in the right direction",
    icon: Lightbulb,
    color: "text-yellow-400",
    borderColor: "border-yellow-500/30",
    bgColor: "bg-yellow-500/5",
    glowColor: "hover:border-yellow-500/50",
    badgeColor: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
  },
  {
    tier: 2,
    label: "Approach",
    sublabel: "Algorithm or strategy to use",
    icon: Brain,
    color: "text-blue-400",
    borderColor: "border-blue-500/30",
    bgColor: "bg-blue-500/5",
    glowColor: "hover:border-blue-500/50",
    badgeColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    tier: 3,
    label: "Pseudocode",
    sublabel: "Step-by-step logic breakdown",
    icon: Code2,
    color: "text-purple-400",
    borderColor: "border-purple-500/30",
    bgColor: "bg-purple-500/5",
    glowColor: "hover:border-purple-500/50",
    badgeColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  },
];

const HintCard = ({ tierConfig, hint, isUnlocked, isLocked, isFetching, onUnlock, expanded, onToggle }) => {
  const { tier, label, sublabel, icon: Icon, color, borderColor, bgColor, glowColor, badgeColor } = tierConfig;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 overflow-hidden
        ${isUnlocked ? `${borderColor} ${bgColor} ${glowColor}` : "border-zinc-800 bg-zinc-900/40"}
        ${isLocked ? "opacity-50" : ""}
      `}
    >
      {/* Card Header */}
      <div
        className={`flex items-center gap-3 px-4 py-3 ${isUnlocked || !isLocked ? "cursor-pointer" : "cursor-not-allowed"}`}
        onClick={() => {
          if (isLocked) return;
          if (isUnlocked) onToggle();
          else onUnlock();
        }}
      >
        {/* Tier icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0
          ${isUnlocked ? `${bgColor} border ${borderColor}` : "bg-zinc-800 border border-zinc-700"}`}
        >
          {isLocked ? (
            <Lock size={14} className="text-zinc-600" />
          ) : (
            <Icon size={14} className={isUnlocked ? color : "text-zinc-500"} />
          )}
        </div>

        {/* Tier info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-semibold ${isUnlocked ? "text-white" : "text-zinc-400"}`}>
              Hint {tier} — {label}
            </span>
            {isUnlocked && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full border font-medium ${badgeColor}`}>
                Unlocked
              </span>
            )}
            {isLocked && (
              <span className="text-[10px] px-1.5 py-0.5 rounded-full border bg-zinc-800 border-zinc-700 text-zinc-500 font-medium">
                Locked
              </span>
            )}
          </div>
          <p className="text-[11px] text-zinc-500 mt-0.5 truncate">{sublabel}</p>
        </div>

        {/* Right action */}
        <div className="shrink-0">
          {isFetching ? (
            <Loader2 size={14} className={`${color} animate-spin`} />
          ) : isUnlocked ? (
            expanded
              ? <ChevronUp size={14} className="text-zinc-400" />
              : <ChevronDown size={14} className="text-zinc-400" />
          ) : isLocked ? null : (
            <span className={`text-[11px] font-medium ${color}`}>Reveal →</span>
          )}
        </div>
      </div>

      {/* Hint content */}
      {isUnlocked && expanded && hint && (
        <div className={`px-4 pb-4 pt-1 border-t ${borderColor}`}>
          <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-wrap">{hint}</p>
        </div>
      )}

      {/* Loading skeleton */}
      {isFetching && (
        <div className={`px-4 pb-4 pt-1 border-t ${borderColor}`}>
          <div className="space-y-2 animate-pulse">
            <div className="h-3 bg-zinc-700 rounded w-full" />
            <div className="h-3 bg-zinc-700 rounded w-4/5" />
            <div className="h-3 bg-zinc-700 rounded w-3/5" />
          </div>
        </div>
      )}
    </div>
  );
};

const HintPanel = ({ problem, isGuest }) => {
  const dispatch = useDispatch();
  const problemId = problem?._id;

  const { hints, unlockedUpTo, hintLoading, hintError, fetchingTier } = useSelector((state) => state.ai);

  const problemHints = hints[problemId] || {};
  const maxUnlocked = unlockedUpTo[problemId] ?? 0;

  // Track which cards are expanded
  const [expanded, setExpanded] = useState({ 1: true, 2: true, 3: true });
  // Track confirm state before unlocking tier 2/3
  const [confirming, setConfirming] = useState(null);

  useEffect(() => {
    if (!isGuest && problemId) {
      dispatch(fetchUnlockedTiers({ problemId }));
    }
  }, [problemId, isGuest, dispatch]);

  const handleUnlock = (tier) => {
    if (tier > 1 && confirming !== tier) {
      setConfirming(tier);
      return;
    }
    setConfirming(null);
    dispatch(fetchHint({ problemId, tier })).then(() => {
      setExpanded((prev) => ({ ...prev, [tier]: true }));
    });
  };

  const handleToggle = (tier) => {
    setExpanded((prev) => ({ ...prev, [tier]: !prev[tier] }));
  };

  if (isGuest) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center gap-3">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Lock size={20} className="text-purple-400" />
        </div>
        <p className="text-zinc-400 text-sm">Sign in to access AI hints</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 px-1 py-1">

      {/* Header */}
      <div className="flex items-center gap-2 mb-1">
        <Sparkles size={13} className="text-purple-400" />
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">AI Hints</span>
        <span className="ml-auto text-[11px] text-zinc-600">{maxUnlocked}/3 unlocked</span>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 bg-zinc-800 rounded-full overflow-hidden mb-1">
        <div
          className="h-full bg-gradient-to-r from-yellow-500 via-blue-500 to-purple-500 transition-all duration-500 rounded-full"
          style={{ width: `${(maxUnlocked / 3) * 100}%` }}
        />
      </div>

      {/* Warning text */}
      <p className="text-[11px] text-zinc-600 leading-relaxed mb-2">
        Hints are tiered — each reveals more. Try to solve it before unlocking deeper hints!
      </p>

      {/* Error banner */}
      {hintError && (
        <div className="flex items-center gap-2 px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-lg mb-1">
          <AlertCircle size={13} className="text-red-400 shrink-0" />
          <p className="text-red-400 text-xs">The AI model is currently experiencing high demand—please try again in a few seconds.</p>
        </div>
      )}

      {/* Hint Cards */}
      <div className="flex flex-col gap-2.5">
        {TIERS.map(({ tier, ...rest }) => {
          const isUnlocked = maxUnlocked >= tier;
          const isLocked = tier > maxUnlocked + 1;
          const isFetching = hintLoading && fetchingTier === tier;

          return (
            <HintCard
              key={tier}
              tierConfig={{ tier, ...rest }}
              hint={problemHints[tier]}
              isUnlocked={isUnlocked}
              isLocked={isLocked}
              isFetching={isFetching}
              onUnlock={() => handleUnlock(tier)}
              expanded={expanded[tier]}
              onToggle={() => handleToggle(tier)}
            />
          );
        })}
      </div>

      {/* Confirm banner for tier 2/3 */}
      {confirming && (
        <div className="flex items-center justify-between gap-2 px-3 py-2.5 bg-zinc-800 border border-zinc-700 rounded-lg mb-1">
          <p className="text-zinc-300 text-xs leading-snug">
            Unlocking Tier {confirming} will reveal more of the solution. Continue?
          </p>
          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setConfirming(null)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-zinc-700 text-zinc-400 hover:bg-zinc-600 transition"
            >
              Cancel
            </button>
            <button
              onClick={() => handleUnlock(confirming)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-purple-600 text-white hover:bg-purple-700 transition"
            >
              Unlock
            </button>
          </div>
        </div>
      )}

      {/* All unlocked message */}
      {maxUnlocked === 3 && (
        <div className="flex items-center gap-2 px-3 py-2.5 bg-purple-500/10 border border-purple-500/20 rounded-lg mt-1">
          <Sparkles size={13} className="text-purple-400" />
          <p className="text-purple-300 text-xs">All hints unlocked. You've got this! 💪</p>
        </div>
      )}
    </div>
  );
};

export default HintPanel;