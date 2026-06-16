import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { Timer, RotateCcw, Play } from "lucide-react";
import ContestTimer from "./ContestTimer";
import { startMock, resetMock } from "../../features/contests/contestMockSlice";
import { clearMockCode } from "../../features/code/codePersistenceSlice";

const fmtDuration = (ms) => {
  const totalMin = Math.max(1, Math.round(ms / 60000));
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  if (h && m) return `${h}h ${m}m`;
  if (h) return `${h}h`;
  return `${m}m`;
};

// Shown on an ended contest's page. Lets the user run a personal, timed
// re-run (same duration) with a private mock score. State comes from the
// contestMock slice (also used by the problem page during the run).
export default function MockContestCard({ contestId, contest }) {
  const dispatch = useDispatch();
  const { mock, serverTimeOffset, starting } = useSelector(
    (state) => state.contestMock
  );
  const [confirmReset, setConfirmReset] = useState(false);

  const durationMs =
    new Date(contest.endTime).getTime() - new Date(contest.startTime).getTime();
  const now = Date.now() + (serverTimeOffset || 0);
  const active = mock && now <= new Date(mock.endTime).getTime();
  const finished = mock && now > new Date(mock.endTime).getTime();
  const solvedCount = mock
    ? mock.problemStats.filter((s) => s.solved).length
    : 0;

  const handleStart = async () => {
    const action = await dispatch(startMock(contestId));
    if (startMock.fulfilled.match(action)) {
      toast.success("Mock started — good luck!");
    } else {
      toast.error(action.payload || "Failed to start mock");
    }
  };

  const handleReset = async () => {
    setConfirmReset(false);
    const action = await dispatch(resetMock(contestId));
    if (resetMock.fulfilled.match(action)) {
      dispatch(clearMockCode()); // wipe mock-only editor code for a clean restart
      toast.success("Mock reset");
    } else {
      toast.error(action.payload || "Failed to reset mock");
    }
  };

  return (
    <div className="bg-zinc-900 border border-purple-500/30 rounded-2xl p-5 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Timer size={16} className="text-purple-400" />
        <h2 className="text-sm font-semibold text-white">Mock Contest</h2>
        <span className="ml-auto text-xs text-zinc-500">
          {fmtDuration(durationMs)} window
        </span>
      </div>

      {!mock && (
        <>
          <p className="text-sm text-zinc-400 mb-4">
            Re-run this contest on your own clock — you get the same{" "}
            <span className="text-zinc-200 font-medium">
              {fmtDuration(durationMs)}
            </span>{" "}
            to solve it. Your submissions earn a personal mock score, separate
            from the official standings.
          </p>
          <button
            onClick={handleStart}
            disabled={starting}
            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition text-sm disabled:opacity-50"
          >
            <Play size={14} />
            {starting ? "Starting…" : "Start Mock Contest"}
          </button>
        </>
      )}

      {active && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <ContestTimer
            contest={{
              _id: contestId,
              startTime: mock.startTime,
              endTime: mock.endTime,
            }}
            serverTimeOffset={serverTimeOffset}
          />
          <div className="flex items-center gap-4 text-sm">
            <span className="text-zinc-500">Mock score:</span>
            <span className="text-purple-400 font-bold">{mock.score}</span>
            <span className="text-zinc-600 text-xs">{solvedCount} solved</span>
            <button
              onClick={() => setConfirmReset(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-400 hover:text-red-400 hover:border-red-500/40 transition text-xs"
            >
              <RotateCcw size={12} />
              Reset
            </button>
          </div>
        </div>
      )}

      {finished && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-sm">
            <span className="px-2.5 py-1 rounded-full bg-zinc-500/10 border border-zinc-500/20 text-zinc-400 text-xs font-semibold">
              Mock completed
            </span>
            <span className="text-zinc-500">Final score:</span>
            <span className="text-purple-400 font-bold">{mock.score}</span>
            <span className="text-zinc-600 text-xs">{solvedCount} solved</span>
          </div>
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-purple-400 hover:border-purple-500/40 transition text-xs"
          >
            <RotateCcw size={12} />
            Restart mock
          </button>
        </div>
      )}

      {confirmReset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-zinc-800 text-white w-[90%] max-w-md p-6 rounded-xl shadow-xl m-4">
            <h2 className="mb-6 text-lg text-gray-200">
              Reset your mock run? This clears your{" "}
              <span className="text-yellow-500 font-bold">mock score and timer</span>{" "}
              so you can start fresh.
            </h2>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 text-sm bg-zinc-700 rounded hover:bg-zinc-600"
                onClick={() => setConfirmReset(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 text-sm rounded font-semibold bg-yellow-600 hover:bg-yellow-500"
                onClick={handleReset}
              >
                Reset Mock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
