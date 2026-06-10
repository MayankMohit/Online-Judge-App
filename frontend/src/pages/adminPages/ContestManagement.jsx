import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-hot-toast";
import { Plus, Trash2, Lock } from "lucide-react";
import {
  createContest,
  updateContest,
  deleteContest,
  fetchContestForEdit,
  clearAdminContest,
} from "../../features/contests/contestAdminSlice";
import TopBar from "../submissionPages/TopBar";
import LoadingScreen from "../../components/LoadingScreen";

// Date → value for <input type="datetime-local"> (local timezone)
const toLocalInputValue = (date) => {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
};

const inputClass =
  "w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 disabled:opacity-50 disabled:cursor-not-allowed";

export default function ContestManagement() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { contestId } = useParams();
  const isEditing = !!contestId;

  const { contest, loading, saving } = useSelector((state) => state.contestAdmin);

  const [form, setForm] = useState({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
  });
  const [problems, setProblems] = useState([]); // [{ problem: {…}, points }]
  const [formErrors, setFormErrors] = useState({});
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  useEffect(() => {
    if (isEditing) dispatch(fetchContestForEdit(contestId));
    return () => dispatch(clearAdminContest());
  }, [dispatch, contestId, isEditing]);

  useEffect(() => {
    if (isEditing && contest) {
      setForm({
        title: contest.title || "",
        description: contest.description || "",
        startTime: toLocalInputValue(contest.startTime),
        endTime: toLocalInputValue(contest.endTime),
      });
      setProblems(contest.problems || []);
    }
  }, [isEditing, contest?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  const status = isEditing ? contest?.status || "upcoming" : "upcoming";
  const started = isEditing && status !== "upcoming";

  const validate = () => {
    const errors = {};
    if (!form.title.trim()) errors.title = "Title is required";
    if (!form.startTime) errors.startTime = "Start time is required";
    if (!form.endTime) errors.endTime = "End time is required";
    if (
      form.startTime &&
      form.endTime &&
      new Date(form.endTime) <= new Date(form.startTime)
    ) {
      errors.endTime = "End time must be after start time";
    }
    if (!isEditing && form.startTime && new Date(form.startTime) < new Date()) {
      errors.startTime = "Start time must be in the future";
    }
    return errors;
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setFormErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handlePointsChange = (index, value) => {
    setProblems((prev) =>
      prev.map((p, i) => (i === index ? { ...p, points: value } : p))
    );
  };

  const handleRemoveProblem = (index) => {
    setProblems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const errors = validate();
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    const payload = {
      title: form.title.trim(),
      description: form.description.trim(),
      endTime: new Date(form.endTime).toISOString(),
    };
    if (!started) {
      payload.startTime = new Date(form.startTime).toISOString();
    }

    if (isEditing) {
      if (!started) {
        payload.problems = problems.map((p) => ({
          problem: p.problem._id || p.problem,
          points: Math.max(1, Number(p.points) || 100),
        }));
      }
      const action = await dispatch(updateContest({ contestId, ...payload }));
      if (updateContest.fulfilled.match(action)) {
        toast.success("Contest updated");
      } else {
        toast.error(action.payload || "Failed to update contest");
      }
    } else {
      const action = await dispatch(createContest(payload));
      if (createContest.fulfilled.match(action)) {
        toast.success("Contest created — now add problems");
        navigate(`/admin/contests/edit/${action.payload._id}`, { replace: true });
      } else {
        toast.error(action.payload || "Failed to create contest");
      }
    }
  };

  const handleDelete = async () => {
    const action = await dispatch(deleteContest(contestId));
    if (deleteContest.fulfilled.match(action)) {
      toast.success("Contest deleted");
      navigate("/contests");
    } else {
      toast.error(action.payload || "Failed to delete contest");
    }
    setShowDeleteDialog(false);
  };

  if (isEditing && loading && !contest) return <LoadingScreen />;

  return (
    <div className="w-full min-h-screen bg-black text-white">
      <TopBar
        title={isEditing ? "Edit Contest" : "Create Contest"}
        onBack={() => navigate(-1)}
      />

      <div className="sm:w-[60vw] w-[95%] mx-auto sm:my-6 my-2 flex flex-col gap-4">
        {/* Contest details */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:p-6 p-3 space-y-4">
          {isEditing && (
            <div className="flex items-center justify-between">
              <span
                className={`px-2.5 py-1 rounded-full border text-xs font-semibold ${
                  status === "running"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : status === "upcoming"
                    ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                }`}
              >
                {status === "running" ? "Live" : status}
              </span>
              {started && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Lock size={11} />
                  Start time & problems locked after start
                </span>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Title</label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Weekly Contest #1"
              className={inputClass}
            />
            {formErrors.title && (
              <p className="text-red-400 text-xs mt-1">{formErrors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-zinc-400 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="What is this contest about?"
              rows={3}
              className={inputClass}
            />
          </div>

          <div className="grid sm:grid-cols-2 grid-cols-1 gap-4">
            <div>
              <label className="block text-sm text-zinc-400 mb-1">Start time</label>
              <input
                type="datetime-local"
                value={form.startTime}
                onChange={(e) => handleChange("startTime", e.target.value)}
                disabled={started}
                className={inputClass}
              />
              {formErrors.startTime && (
                <p className="text-red-400 text-xs mt-1">{formErrors.startTime}</p>
              )}
            </div>
            <div>
              <label className="block text-sm text-zinc-400 mb-1">End time</label>
              <input
                type="datetime-local"
                value={form.endTime}
                onChange={(e) => handleChange("endTime", e.target.value)}
                className={inputClass}
              />
              {formErrors.endTime && (
                <p className="text-red-400 text-xs mt-1">{formErrors.endTime}</p>
              )}
            </div>
          </div>
        </div>

        {/* Problems — only after the contest exists */}
        {isEditing && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl sm:p-6 p-3 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">
                Problems ({problems.length})
              </h2>
              {!started && (
                <button
                  onClick={() =>
                    navigate(
                      `/admin/problem/new?contestId=${contestId}&returnTo=${encodeURIComponent(
                        `/admin/contests/edit/${contestId}`
                      )}`
                    )
                  }
                  className="flex items-center gap-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg transition"
                >
                  <Plus size={14} />
                  Add problem
                </button>
              )}
            </div>

            {problems.length === 0 ? (
              <p className="text-zinc-500 text-sm py-4 text-center">
                No problems yet. Create hidden contest problems with "Add problem".
              </p>
            ) : (
              problems.map((entry, i) => (
                <div
                  key={entry.problem?._id || i}
                  className="flex items-center gap-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl px-3 py-2"
                >
                  <span className="w-7 h-7 shrink-0 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold text-xs">
                    {String.fromCharCode(65 + i)}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate">
                      {entry.problem?.title || "Untitled"}
                    </p>
                    <p className="text-xs text-zinc-500">
                      #{entry.problem?.problemNumber} · {entry.problem?.difficulty}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <input
                      type="number"
                      min={1}
                      value={entry.points}
                      onChange={(e) => handlePointsChange(i, e.target.value)}
                      disabled={started}
                      className="w-20 bg-zinc-800 border border-zinc-700 rounded-lg px-2 py-1 text-sm text-white text-center focus:outline-none focus:border-purple-500 disabled:opacity-50"
                    />
                    <span className="text-xs text-zinc-500">pts</span>
                  </div>
                  {!started && (
                    <button
                      onClick={() => handleRemoveProblem(i)}
                      className="text-zinc-600 hover:text-red-400 transition shrink-0"
                      title="Remove from contest (problem stays as hidden draft)"
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3">
          {isEditing && status !== "running" ? (
            <button
              onClick={() => setShowDeleteDialog(true)}
              disabled={saving}
              className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-red-400 hover:border-red-500/40 transition text-sm disabled:opacity-50"
            >
              Delete contest
            </button>
          ) : (
            <span />
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition text-sm disabled:opacity-50"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Create contest"}
          </button>
        </div>
      </div>

      {/* Delete confirmation */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold mb-2">Delete this contest?</h3>
            <p className="text-zinc-500 text-sm mb-5">
              {status === "upcoming"
                ? "Its unreleased problems will be deleted too. This cannot be undone."
                : "Participation records will be removed. Released problems stay public."}
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 rounded-xl bg-zinc-800 border border-zinc-700 text-zinc-300 hover:text-white transition text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={saving}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white transition text-sm disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
