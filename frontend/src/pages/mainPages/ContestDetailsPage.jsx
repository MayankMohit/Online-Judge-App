import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { Trophy, Users, CalendarClock, ArrowLeft } from "lucide-react";
import {
  fetchContestById,
  registerForContest,
  unregisterFromContest,
  clearCurrentContest,
} from "../../features/contests/contestsSlice";
import { fetchStandings, clearStandings } from "../../features/contests/standingsSlice";
import { fetchMyMock, clearMock } from "../../features/contests/contestMockSlice";
import { useAuthStore } from "../../store/authStore";
import { formatDate } from "../../utils/date";
import ContestTimer from "../../components/ContestComps/ContestTimer";
import ContestProblemRow from "../../components/ContestComps/ContestProblemRow";
import StandingsTable from "../../components/ContestComps/StandingsTable";
import MockContestCard from "../../components/ContestComps/MockContestCard";
import {
  ContestDetailSkeleton,
  StandingsSkeleton,
} from "../../components/ContestComps/ContestSkeletons";

const POLL_INTERVAL_MS = 20000;

const ContestDetailsPage = () => {
  const { contestId } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const {
    currentContest: contest,
    isRegistered,
    myStats,
    serverTimeOffset,
    detailLoading,
    registering,
    error,
  } = useSelector((state) => state.contests);
  const standings = useSelector((state) => state.standings);
  const { mock, serverTimeOffset: mockOffset } = useSelector(
    (state) => state.contestMock
  );

  const [activeTab, setActiveTab] = useState("problems");
  const [page, setPage] = useState(1);

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchContestById(contestId));
    return () => {
      dispatch(clearCurrentContest());
      dispatch(clearStandings());
      dispatch(clearMock());
    };
  }, [dispatch, contestId]);

  // Load the user's mock run once we know the contest has ended
  useEffect(() => {
    if (contest?.status === "ended" && isAuthenticated && user?.isVerified) {
      dispatch(fetchMyMock(contestId));
    }
  }, [dispatch, contestId, contest?.status, isAuthenticated, user?.isVerified]);

  // Fetch standings when tab opens or page changes
  useEffect(() => {
    if (activeTab === "standings") {
      dispatch(fetchStandings({ contestId, page }));
    }
  }, [dispatch, contestId, activeTab, page]);

  // Poll standings while contest is running and the tab is visible
  useEffect(() => {
    if (activeTab !== "standings" || contest?.status !== "running") return;
    const interval = setInterval(() => {
      dispatch(fetchStandings({ contestId, page, silent: true }));
    }, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [dispatch, contestId, activeTab, page, contest?.status]);

  // Refetch everything when the contest goes live or ends
  const handlePhaseChange = useCallback(() => {
    dispatch(fetchContestById(contestId));
    if (activeTab === "standings") {
      dispatch(fetchStandings({ contestId, page, silent: true }));
    }
  }, [dispatch, contestId, activeTab, page]);

  const handleRegister = async () => {
    if (!isAuthenticated || !user?.isVerified) {
      toast.error("Log in to register for contests");
      navigate("/login");
      return;
    }
    const action = await dispatch(registerForContest(contestId));
    if (registerForContest.fulfilled.match(action)) {
      toast.success("Registered for contest!");
    } else {
      toast.error(action.payload || "Failed to register");
    }
  };

  const handleUnregister = async () => {
    const action = await dispatch(unregisterFromContest(contestId));
    if (unregisterFromContest.fulfilled.match(action)) {
      toast.success("Unregistered from contest");
    } else {
      toast.error(action.payload || "Failed to unregister");
    }
  };

  if (detailLoading && !contest) {
    return (
      <div className="min-h-screen w-screen bg-black text-white px-4 py-10 mt-8">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate("/contests")}
              className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition text-sm"
            >
              <ArrowLeft size={14} />
              All contests
            </button>
          </div>
          <ContestDetailSkeleton />
        </div>
      </div>
    );
  }

  if (error && !contest) {
    return (
      <div className="min-h-screen w-screen bg-black text-white flex flex-col items-center justify-center gap-4">
        <p className="text-red-400">{error}</p>
        <button
          onClick={() => navigate("/contests")}
          className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition text-sm"
        >
          Back to contests
        </button>
      </div>
    );
  }

  if (!contest) return null;

  const status = contest.status;
  const solvedSet = new Set(
    (myStats?.problemStats || [])
      .filter((s) => s.solved)
      .map((s) => (typeof s.problem === "object" ? s.problem._id : s.problem))
  );
  const problemsLocked = status === "upcoming" || (status === "running" && !isRegistered);

  // Mock run state (only meaningful once the contest has ended)
  const nowMs = Date.now() + (mockOffset || 0);
  const mockActive =
    status === "ended" &&
    mock &&
    nowMs >= new Date(mock.startTime).getTime() &&
    nowMs <= new Date(mock.endTime).getTime();

  return (
    <div className="min-h-screen w-screen bg-black text-white px-4 py-10 mt-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/contests")}
            className="flex items-center gap-1.5 text-zinc-500 hover:text-white transition text-sm"
          >
            <ArrowLeft size={14} />
            All contests
          </button>
          {user?.role === "admin" && (
            <button
              onClick={() => navigate(`/admin/contests/edit/${contestId}`)}
              className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-purple-400 hover:border-purple-500/40 transition text-xs"
            >
              Edit contest
            </button>
          )}
        </div>

        {/* Header */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 mb-6">
          <div className="flex items-start justify-between gap-3 mb-3">
            <h1 className="text-xl font-bold text-white">{contest.title}</h1>
            <span
              className={`shrink-0 px-2.5 py-1 rounded-full border text-xs font-semibold ${
                status === "running"
                  ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : status === "upcoming"
                  ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
              }`}
            >
              {status === "running" ? "Live" : status === "upcoming" ? "Upcoming" : "Ended"}
            </span>
          </div>

          {contest.description && (
            <p className="text-sm text-zinc-400 mb-4">{contest.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-zinc-500 mb-4">
            <span className="flex items-center gap-1.5">
              <CalendarClock size={13} />
              {formatDate(contest.startTime)} → {formatDate(contest.endTime)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users size={13} />
              {contest.registeredCount} registered
            </span>
            <span className="flex items-center gap-1.5">
              <Trophy size={13} />
              {contest.problemCount} problem{contest.problemCount !== 1 ? "s" : ""}
            </span>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <ContestTimer
              contest={contest}
              serverTimeOffset={serverTimeOffset}
              onPhaseChange={handlePhaseChange}
            />

            {status !== "ended" &&
              (isRegistered ? (
                status === "upcoming" ? (
                  <button
                    onClick={handleUnregister}
                    disabled={registering}
                    className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-red-400 hover:border-red-500/40 transition text-sm disabled:opacity-50"
                  >
                    Unregister
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm font-medium">
                    Registered ✓
                  </span>
                )
              ) : (
                <button
                  onClick={handleRegister}
                  disabled={registering}
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition text-sm disabled:opacity-50"
                >
                  {registering ? "Registering…" : "Register"}
                </button>
              ))}
          </div>

          {myStats && status !== "upcoming" && (
            <div className="mt-4 pt-4 border-t border-zinc-800 flex items-center gap-4 text-sm">
              <span className="text-zinc-500">Your score:</span>
              <span className="text-purple-400 font-bold">{myStats.score}</span>
              <span className="text-zinc-600 text-xs">
                {solvedSet.size} solved · {myStats.totalAttempts} wrong attempts
              </span>
            </div>
          )}
        </div>

        {/* Mock contest — only after the contest has ended, for logged-in users */}
        {status === "ended" && isAuthenticated && user?.isVerified && (
          <MockContestCard contestId={contestId} contest={contest} />
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-5">
          {["problems", "standings"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border capitalize ${
                activeTab === tab
                  ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "problems" ? (
          <div className="flex flex-col gap-3">
            {status === "upcoming" ? (
              <div className="text-center text-zinc-500 py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                Problems will be revealed when the contest starts.
                {!isRegistered && (
                  <p className="text-xs mt-2 text-zinc-600">Register now so you're ready!</p>
                )}
              </div>
            ) : status === "running" && !isRegistered ? (
              <div className="text-center text-zinc-500 py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                Register to view and solve the problems — the contest is live!
              </div>
            ) : contest.problems.length === 0 ? (
              <div className="text-center text-zinc-500 py-12 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
                No problems in this contest
              </div>
            ) : (
              contest.problems.map((entry, i) => (
                <ContestProblemRow
                  key={entry.problem?._id || i}
                  contestId={contestId}
                  entry={entry}
                  index={i}
                  locked={problemsLocked}
                  solved={mockActive ? false : solvedSet.has(entry.problem?._id)}
                  mockActive={mockActive}
                />
              ))
            )}
          </div>
        ) : standings.loading && standings.rows.length === 0 ? (
          <StandingsSkeleton />
        ) : (
          <StandingsTable
            rows={standings.rows}
            myRow={standings.myRow}
            problems={standings.problems}
            startTime={contest.startTime}
            refreshing={standings.refreshing}
            page={standings.page}
            totalPages={standings.totalPages}
            onPageChange={setPage}
          />
        )}
      </div>
    </div>
  );
};

export default ContestDetailsPage;
