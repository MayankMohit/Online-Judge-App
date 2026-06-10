import { useEffect, useRef, useState } from "react";
import { Clock } from "lucide-react";

// Derives the current phase from contest times + server clock offset.
const getPhase = (contest, offset) => {
  const now = Date.now() + offset;
  if (now < new Date(contest.startTime).getTime()) return "upcoming";
  if (now <= new Date(contest.endTime).getTime()) return "running";
  return "ended";
};

const pad = (n) => String(n).padStart(2, "0");

const formatRemaining = (ms) => {
  if (ms <= 0) return "00:00:00";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const h = Math.floor((totalSec % 86400) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  return days > 0 ? `${days}d ${pad(h)}:${pad(m)}:${pad(s)}` : `${pad(h)}:${pad(m)}:${pad(s)}`;
};

/**
 * Counts down to start (upcoming) or end (running) using server-corrected time.
 * onPhaseChange(newPhase) fires when the contest goes live or ends.
 */
const ContestTimer = ({ contest, serverTimeOffset = 0, onPhaseChange, compact = false }) => {
  const [, forceTick] = useState(0);
  const phaseRef = useRef(getPhase(contest, serverTimeOffset));

  useEffect(() => {
    phaseRef.current = getPhase(contest, serverTimeOffset);
    const interval = setInterval(() => {
      const next = getPhase(contest, serverTimeOffset);
      if (next !== phaseRef.current) {
        phaseRef.current = next;
        onPhaseChange?.(next);
      }
      forceTick((t) => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [contest._id, contest.startTime, contest.endTime, serverTimeOffset]);

  const phase = phaseRef.current;
  const now = Date.now() + serverTimeOffset;

  let label, time, color;
  if (phase === "upcoming") {
    label = "Starts in";
    time = formatRemaining(new Date(contest.startTime).getTime() - now);
    color = "text-blue-400";
  } else if (phase === "running") {
    label = "Ends in";
    time = formatRemaining(new Date(contest.endTime).getTime() - now);
    color = "text-green-400";
  } else {
    label = "Contest";
    time = "Ended";
    color = "text-zinc-500";
  }

  if (compact) {
    return (
      <span className={`flex items-center gap-1.5 font-mono text-sm font-semibold ${color}`}>
        <Clock size={14} />
        {phase === "ended" ? "Ended" : time}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Clock size={16} className={color} />
      <span className="text-zinc-500 text-sm">{label}</span>
      <span className={`font-mono text-lg font-bold ${color}`}>{time}</span>
    </div>
  );
};

export default ContestTimer;
