import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trophy } from "lucide-react";
import { fetchContests } from "../../features/contests/contestsSlice";
import ContestCard from "../../components/ContestComps/ContestCard";
import { ContestCardSkeleton } from "../../components/ContestComps/ContestSkeletons";

const TABS = [
  { key: "running", label: "Live" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
];

const ContestsPage = () => {
  const dispatch = useDispatch();
  const { items, loading, error, serverTimeOffset } = useSelector(
    (state) => state.contests
  );
  const [activeTab, setActiveTab] = useState("running");

  useEffect(() => {
    window.scrollTo(0, 0);
    dispatch(fetchContests({}));
  }, [dispatch]);

  const grouped = useMemo(() => {
    const g = { running: [], upcoming: [], past: [] };
    for (const c of items) {
      if (c.status === "running") g.running.push(c);
      else if (c.status === "upcoming") g.upcoming.push(c);
      else g.past.push(c);
    }
    g.past.reverse();
    return g;
  }, [items]);

  // Default to the first tab that actually has contests
  useEffect(() => {
    if (loading || items.length === 0) return;
    if (grouped[activeTab].length === 0) {
      const firstWithContent = TABS.find((t) => grouped[t.key].length > 0);
      if (firstWithContent) setActiveTab(firstWithContent.key);
    }
  }, [loading, items.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const visible = grouped[activeTab];

  return (
    <div className="min-h-screen w-screen bg-black text-white px-4 py-10 mt-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mb-2">
            <Trophy size={24} className="text-purple-400" />
          </div>
          <h1 className="text-2xl font-bold text-white">Contests</h1>
          <p className="text-zinc-500 text-sm text-center">
            Compete in timed coding contests and climb the rankings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${
                activeTab === tab.key
                  ? "bg-purple-600/20 border-purple-500/40 text-purple-300"
                  : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-white"
              }`}
            >
              {tab.label}
              {grouped[tab.key].length > 0 && (
                <span className="ml-1.5 text-xs opacity-70">
                  {grouped[tab.key].length}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex flex-col gap-4">
            <ContestCardSkeleton />
            <ContestCardSkeleton />
            <ContestCardSkeleton />
          </div>
        ) : error ? (
          <div className="text-center text-red-400 py-10">{error}</div>
        ) : visible.length === 0 ? (
          <div className="text-center text-zinc-500 py-16 bg-zinc-900/50 border border-zinc-800 rounded-2xl">
            No {activeTab === "running" ? "live" : activeTab} contests right now
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            {visible.map((contest) => (
              <ContestCard
                key={contest._id}
                contest={contest}
                serverTimeOffset={serverTimeOffset}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ContestsPage;
