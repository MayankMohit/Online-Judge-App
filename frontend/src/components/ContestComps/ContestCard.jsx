import { Link } from "react-router-dom";
import { Users, ListChecks, CheckCircle2 } from "lucide-react";
import { formatDate } from "../../utils/date";
import ContestTimer from "./ContestTimer";

const statusBadge = {
  running: "bg-green-500/10 text-green-400 border-green-500/20",
  upcoming: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  ended: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
};

const statusLabel = { running: "Live", upcoming: "Upcoming", ended: "Ended" };

const ContestCard = ({ contest, serverTimeOffset }) => {
  return (
    <Link
      to={`/contests/${contest._id}`}
      className="block bg-zinc-900 border border-zinc-800 rounded-2xl p-5 hover:border-purple-500/40 transition group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-base font-semibold text-white group-hover:text-purple-400 transition truncate">
          {contest.title}
        </h3>
        <span
          className={`shrink-0 px-2 py-0.5 rounded-full border text-xs font-semibold ${
            statusBadge[contest.status] || statusBadge.ended
          }`}
        >
          {statusLabel[contest.status] || contest.status}
        </span>
      </div>

      {contest.description && (
        <p className="text-sm text-zinc-500 line-clamp-2 mb-3">{contest.description}</p>
      )}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-zinc-500 mb-3">
        <span>{formatDate(contest.startTime)}</span>
        <span className="flex items-center gap-1">
          <ListChecks size={12} />
          {contest.problemCount} problem{contest.problemCount !== 1 ? "s" : ""}
        </span>
        <span className="flex items-center gap-1">
          <Users size={12} />
          {contest.registeredCount} registered
        </span>
      </div>

      <div className="flex items-center justify-between">
        <ContestTimer contest={contest} serverTimeOffset={serverTimeOffset} compact />
        {contest.isRegistered && (
          <span className="flex items-center gap-1 text-xs text-green-400">
            <CheckCircle2 size={12} />
            Registered
          </span>
        )}
      </div>
    </Link>
  );
};

export default ContestCard;
