import { useEffect, useState } from "react";
import { Sparkles, RotateCcw, Loader2, Clock } from "lucide-react";

const COOLDOWN_SECONDS = 10;

/**
 * AutocompleteButton
 * Props:
 *  - onGenerate: () => void  — triggers AI generation
 *  - onReset: () => void     — resets AI-filled fields back to user-filled
 *  - isGenerated: boolean    — true when AI has already filled fields
 *  - isLoading: boolean      — true while API call is in progress
 *  - disabled: boolean       — true if title is empty (can't generate)
 *  - error: string | null    — error message to show
 */
export default function AutocompleteButton({
  onGenerate,
  onReset,
  isGenerated,
  isLoading,
  disabled,
  error,
}) {
  const [cooldown, setCooldown] = useState(0);

  // Start cooldown after a successful generation
  useEffect(() => {
    if (!isLoading && isGenerated && cooldown === 0) return;
    if (!isLoading && cooldown === 0) return;
  }, [isLoading]);

  const handleGenerate = () => {
    if (cooldown > 0 || isLoading || disabled) return;
    onGenerate();
    // Start 10s cooldown immediately
    setCooldown(COOLDOWN_SECONDS);
  };

  // Countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [cooldown]);

  const isCoolingDown = cooldown > 0;

  return (
    <div className="flex flex-col gap-1.5 mt-1">
      <div className="flex items-center gap-2">
        {/* Main button */}
        {!isGenerated ? (
          <button
            type="button"
            onClick={handleGenerate}
            disabled={disabled || isLoading || isCoolingDown}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition
              bg-purple-600 hover:bg-purple-700 text-white
              disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin" />
                Generating...
              </>
            ) : isCoolingDown ? (
              <>
                <Clock size={13} />
                Wait {cooldown}s
              </>
            ) : (
              <>
                <Sparkles size={13} />
                Auto Complete
              </>
            )}
          </button>
        ) : (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition
              bg-zinc-700 hover:bg-zinc-600 border border-zinc-600 text-zinc-200"
          >
            <RotateCcw size={13} />
            Reset AI Fields
          </button>
        )}

        {/* Hint text */}
        {!isGenerated && !isLoading && !isCoolingDown && (
          <span className="text-[11px] text-zinc-500">
            {disabled ? "Enter a title first" : "AI will fill all remaining fields"} (This feature is experimental and may produce imperfect results. Always review and edit the generated content!)
          </span>
        )}
        {isGenerated && (
          <span className="text-[11px] text-green-500">
            ✓ Fields filled by AI — edit freely or reset
          </span>
        )}
        {isCoolingDown && !isLoading && (
          <span className="text-[11px] text-zinc-500">
            Cooldown: {cooldown}s remaining
          </span>
        )}
      </div>

      {/* Error */}
      {error && (
        <p className="text-[11px] text-red-400 flex items-center gap-1">
          ⚠ {error}
        </p>
      )}
    </div>
  );
}