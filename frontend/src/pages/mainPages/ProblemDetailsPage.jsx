import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate, Link, useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { Lock } from "lucide-react";
import { useAuthStore } from "../../store/authStore";

import { fetchProblemByNumber, clearCurrentProblem } from "../../features/problems/problemsSlice";
import { fetchSubmissionsByProblem, clearProblemSubmissions } from "../../features/submissions/problemSubmissionsSlice";
import { runAllTestCases, submitCode, clearCodeState } from "../../features/code/codeSlice";
import { fetchSavedCode, saveCodeToDB, updateCodeLocally, updateMockCodeLocally } from "../../features/code/codePersistenceSlice";
import { fetchMyMock, clearMock } from "../../features/contests/contestMockSlice";

import { languageBoilerplates } from "../../components/ProblemPageComps/LanguageBoilerplates";
import { getPreferredLanguage, savePreferredLanguage } from "../../utils/languagePreference";
import MobileProblemView from "../../components/ProblemPageComps/MobileProblemView";
import DesktopProblemView from "../../components/ProblemPageComps/DesktopProblemView";
import ContestBanner from "../../components/ContestComps/ContestBanner";
import LoadingScreen from "../../components/LoadingScreen";

const buildInitialTestCases = (problem) => {
  const visible = problem?.testCases?.filter((tc) => !tc.isHidden) || [];
  if (visible.length === 0) return [{ id: Date.now(), label: "Case 1", input: "" }];
  return visible.map((tc, i) => ({ id: tc._id || i, label: `Case ${i + 1}`, input: tc.input || "" }));
};

const ProblemDetailsPage = () => {
  const { isAuthenticated, user } = useAuthStore();
  const isGuest = !isAuthenticated || !user;

  const [leftWidth, setLeftWidth] = useState(38);
  const containerRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(65);
  const [testcaseHeight, setTestcaseHeight] = useState(35);
  const mobileScrollRef = useRef(null);
  const saveTimeout = useRef(null);

  const [activeTab, setActiveTab] = useState("description");
  // Start from the user's remembered language (per-device); falls back to C++.
  const [language, setLanguage] = useState(getPreferredLanguage);
  const [isOutputMode, setIsOutputMode] = useState(false);
  const [testCases, setTestCases] = useState([{ id: 1, label: "Case 1", input: "" }]);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);
  // Tracks whether this problem's submissions have settled — used in mock mode
  // to decide blank-vs-saved code only once "already solved?" is known.
  const [submissionsReady, setSubmissionsReady] = useState(false);

  const { codeMap, mockCodeMap } = useSelector((state) => state.codePersistence);
  const { number, contestId } = useParams();
  const [searchParams] = useSearchParams();
  const isMock = searchParams.get("mock") === "1" && !!contestId;
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    mock: mockData,
    contest: mockContest,
    serverTimeOffset: mockServerOffset,
  } = useSelector((state) => state.contestMock);

  const { currentProblem, problemLoading, problemError, problemErrorInfo, contestMeta, contestTimeOffset } = useSelector((state) => state.problems);
  const { items: userSubmissions, error } = useSelector((state) => state.problemSubmissions);
  const { loading: codeLoading, submissionId, verdict, failedCase, averageTime, lastAction, testCaseResults } = useSelector((state) => state.code);

  useEffect(() => {
    setSubmissionsReady(false);
    if (!isGuest) {
      dispatch(fetchSubmissionsByProblem(number)).finally(() => setSubmissionsReady(true));
    } else {
      setSubmissionsReady(true);
    }
    return () => dispatch(clearProblemSubmissions());
  }, [dispatch, number, isGuest]);

  // Remember the user's language choice so it carries to the next problem/session.
  useEffect(() => {
    savePreferredLanguage(language);
  }, [language]);

  const isSolved = isGuest ? false : userSubmissions.some((sub) => sub.verdict === "accepted");

  // In a mock run, an already-solved problem should start from a clean
  // boilerplate (don't reveal the old solution) — and we keep that attempt
  // out of the saved draft so the real solution isn't overwritten.
  const startBlank = isMock && isSolved;

  useEffect(() => {
    dispatch(fetchProblemByNumber(number));
    dispatch(clearCodeState());
    setIsOutputMode(false);
    setActiveTab("description");
    return () => dispatch(clearCurrentProblem());
  }, [dispatch, number]);

  useEffect(() => {
    if (currentProblem) {
      setTestCases(buildInitialTestCases(currentProblem));
      setActiveTestCaseIdx(0);
    }
  }, [currentProblem?._id]);

  // Mock mode: load the user's personal window + score for the banner/guards
  useEffect(() => {
    if (isMock && !isGuest) dispatch(fetchMyMock(contestId));
    return () => dispatch(clearMock());
  }, [dispatch, isMock, contestId, isGuest]);

  useEffect(() => {
    if (testCaseResults?.length > 0 || verdict || lastAction === "submit") {
      setIsOutputMode(true);
    }
  }, [testCaseResults, verdict, lastAction]);

  useEffect(() => {
    if (isGuest || !currentProblem?._id || !language) return;
    // In mock mode, wait until submissions settle so we never momentarily
    // load the saved solution before knowing the problem was already solved.
    if (isMock && !submissionsReady) return;
    // Blank mock re-attempt: don't load the saved solution. The editor reads
    // mockCodeMap (defaulting to boilerplate), so any code written this mock
    // persists across navigation without touching the saved draft.
    if (startBlank) return;
    dispatch(fetchSavedCode({ problemId: currentProblem._id, language }));
  }, [currentProblem?._id, language, isGuest, startBlank, isMock, submissionsReady]);

  // Current editor contents — CodeMirror is controlled by this on both
  // desktop and mobile. In a blank mock re-attempt it reads the mock-only
  // store; otherwise the saved-draft codeMap (falling back to boilerplate).
  const reduxCode = isGuest
    ? languageBoilerplates[language]
    : startBlank
      ? (mockCodeMap?.[currentProblem?._id]?.[language] ?? languageBoilerplates[language])
      : (codeMap?.[currentProblem?._id]?.[language] || languageBoilerplates[language]);

  const handleCodeChange = (newCode) => {
    if (isGuest) return;
    if (startBlank) {
      // Mock re-attempt — keep code in the mock-only store (persists across
      // navigation this mock), never write to the saved draft or DB.
      dispatch(updateMockCodeLocally({ problemId: currentProblem._id, language, code: newCode }));
      return;
    }
    dispatch(updateCodeLocally({ problemId: currentProblem._id, language, code: newCode }));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      dispatch(saveCodeToDB({ problemId: currentProblem._id, language, code: newCode }));
    }, 2000);
  };

  const backendLanguageMap = { python: "py", javascript: "js", cpp: "cpp", c: "c", java: "java", go: "go", rust: "rust" };

  const handleRun = () => {
    if (isGuest) return;
    setIsOutputMode(true);
    dispatch(runAllTestCases({ code: reduxCode, language: backendLanguageMap[language] || language, testCases }));
  };

  const handleSubmit = () => {
    if (isGuest) return;
    if (isMock) {
      // Mock run — block once the personal window has elapsed (server also enforces this)
      if (mockData) {
        const now = Date.now() + mockServerOffset;
        if (now > new Date(mockData.endTime).getTime()) {
          toast.error("Your mock window has ended");
          return;
        }
      }
    } else if (contestId && contestMeta) {
      // Inside a live contest, block submissions once time is up (server also enforces this)
      const now = Date.now() + contestTimeOffset;
      if (now > new Date(contestMeta.endTime).getTime()) {
        toast.error("The contest has ended — submissions are closed");
        return;
      }
    }
    const codeToSubmit = reduxCode;
    // Only attach the contest when it's a live run or an active mock; otherwise
    // submit as normal (public) practice so an ended-contest URL doesn't 403.
    const isLiveContest = !!contestId && !!contestMeta && contestMeta.status === "running";
    const submitContestId = isMock || isLiveContest ? contestId : null;
    dispatch(submitCode({ problemId: currentProblem._id, code: codeToSubmit, language: backendLanguageMap[language] || language, contestId: submitContestId, mock: isMock }))
      .then((action) => {
        if (submitCode.fulfilled.match(action) && action.payload?.contestUpdate?.awarded) {
          toast.success(`+${action.payload.contestUpdate.pointsEarned} ${isMock ? "mock" : "contest"} points!`);
        }
        dispatch(fetchSubmissionsByProblem(number));
      });
  };

  const handleContestPhaseChange = useCallback((phase) => {
    if (phase === "ended") {
      toast("The contest has ended", { icon: "⏰" });
    }
  }, []);

  const handleMockPhaseChange = useCallback((phase) => {
    if (phase === "ended") {
      toast("Your mock window has ended", { icon: "⏰" });
    }
  }, []);

  if (problemLoading) return <LoadingScreen />;

  // Unregistered (or pre-start) access to a contest problem → guide to the contest page
  if (problemError && problemErrorInfo?.status === 403 && problemErrorInfo?.contestId) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-zinc-950 text-white gap-4 px-4">
        <div className="w-14 h-14 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
          <Lock size={24} className="text-purple-400" />
        </div>
        <h1 className="text-xl font-bold">This problem is part of a contest</h1>
        <p className="text-zinc-500 text-sm text-center max-w-md">
          {problemErrorInfo.contestStatus === "upcoming"
            ? "The contest hasn't started yet. Problems unlock when it goes live."
            : "Register for the contest to view and solve this problem."}
        </p>
        <Link
          to={`/contests/${problemErrorInfo.contestId}`}
          className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium transition text-sm"
        >
          Go to contest
        </Link>
      </div>
    );
  }

  if (problemError) return (
    <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 text-red-400">{problemError}</div>
  );
  if (!currentProblem) return null;

  // contestMeta is only present while the problem is still contest-gated
  // (server stops sending it once the contest ends and the problem is released).
  // During a mock run we also hide hints to keep the contest experience intact.
  const hideHints = (!!contestMeta && contestMeta.status !== "ended") || isMock;

  // Mock banner context — built from the personal window + contest problem list.
  // (contestMeta is null here because the problem is public after the contest ends.)
  const mockMeta =
    isMock && mockData && mockContest
      ? {
          id: mockContest._id,
          title: mockContest.title,
          startTime: mockData.startTime,
          endTime: mockData.endTime,
          problems: (mockContest.problems || []).map((p) => ({
            problemNumber: p.problem?.problemNumber,
            title: p.problem?.title,
            points: p.points,
          })),
          points: (mockContest.problems || []).find(
            (p) => p.problem?.problemNumber === Number(number)
          )?.points,
        }
      : null;

  const sharedProps = {
    activeTab, setActiveTab,
    hideHints,
    currentProblem, userSubmissions,
    loading: codeLoading, error,
    navigate,
    // Hide the "solved" badge during a mock so a re-attempt feels fresh
    // (the real solved status is still used internally for startBlank).
    isSolved: isMock ? false : isSolved,
    language, setLanguage,
    submissionId,
    // Controlled editor value (same for desktop and mobile now)
    code: reduxCode,
    handleRun, handleSubmit,
    handleCodeChange,
    verdict, failedCase, averageTime, lastAction,
    testCases, setTestCases,
    activeTestCaseIdx, setActiveTestCaseIdx,
    testCaseResults, isOutputMode, setIsOutputMode,
  };

  return (
    <div className="w-screen h-screen flex flex-col bg-zinc-950 text-white overflow-hidden">
      {isMock ? (
        mockMeta && (
          <ContestBanner
            contestMeta={mockMeta}
            serverTimeOffset={mockServerOffset}
            onPhaseChange={handleMockPhaseChange}
            currentNumber={number}
            mock
          />
        )
      ) : (
        contestId && contestMeta && (
          <ContestBanner
            contestMeta={contestMeta}
            serverTimeOffset={contestTimeOffset}
            onPhaseChange={handleContestPhaseChange}
            currentNumber={number}
          />
        )
      )}
      <div ref={containerRef} className="w-full flex-1 min-h-0 md:flex overflow-hidden">
        <MobileProblemView {...sharedProps} mobileScrollRef={mobileScrollRef} />
        <DesktopProblemView
          {...sharedProps}
          editorHeight={editorHeight}
          testcaseHeight={testcaseHeight}
          setEditorHeight={setEditorHeight}
          setTestcaseHeight={setTestcaseHeight}
          containerRef={containerRef}
          leftWidth={leftWidth}
          setLeftWidth={setLeftWidth}
        />
      </div>
    </div>
  );
};

export default ProblemDetailsPage;