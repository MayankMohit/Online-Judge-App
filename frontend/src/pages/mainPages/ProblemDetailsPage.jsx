import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

import { fetchProblemByNumber, clearCurrentProblem } from "../../features/problems/problemsSlice";
import { fetchSubmissionsByProblem, clearProblemSubmissions } from "../../features/submissions/problemSubmissionsSlice";
import { runAllTestCases, submitCode, clearCodeState } from "../../features/code/codeSlice";
import { fetchSavedCode, saveCodeToDB, updateCodeLocally } from "../../features/code/codePersistenceSlice";

import { languageBoilerplates } from "../../components/ProblemPageComps/LanguageBoilerplates";
import MobileProblemView from "../../components/ProblemPageComps/MobileProblemView";
import DesktopProblemView from "../../components/ProblemPageComps/DesktopProblemView";
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
  const [language, setLanguage] = useState("cpp");
  const [isOutputMode, setIsOutputMode] = useState(false);
  const [testCases, setTestCases] = useState([{ id: 1, label: "Case 1", input: "" }]);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

  const { codeMap } = useSelector((state) => state.codePersistence);
  const { number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProblem, problemLoading, problemError } = useSelector((state) => state.problems);
  const { items: userSubmissions, error } = useSelector((state) => state.problemSubmissions);
  const { loading: codeLoading, verdict, failedCase, averageTime, lastAction, testCaseResults } = useSelector((state) => state.code);

  // ─── Mobile code ref ────────────────────────────────────────────────────────
  // On mobile, the editor is uncontrolled. We track its latest value in a ref
  // so we can read it for Run/Submit without ever feeding it back as a prop.
  const mobileCodeRef = useRef("");

  useEffect(() => {
    if (!isGuest) {
      dispatch(fetchSubmissionsByProblem(number));
    }
    return () => dispatch(clearProblemSubmissions());
  }, [dispatch, number, isGuest]);

  const isSolved = isGuest ? false : userSubmissions.some((sub) => sub.verdict === "accepted");

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

  useEffect(() => {
    if (testCaseResults?.length > 0 || verdict || lastAction === "submit") {
      setIsOutputMode(true);
    }
  }, [testCaseResults, verdict, lastAction]);

  useEffect(() => {
    if (!isGuest && currentProblem?._id && language) {
      dispatch(fetchSavedCode({ problemId: currentProblem._id, language }));
    }
  }, [currentProblem?._id, language, isGuest]);

  // When Redux loads fresh code (language switch / initial fetch), sync the
  // mobile ref so Run/Submit always have the right starting value.
  const reduxCode = isGuest
    ? languageBoilerplates[language]
    : (codeMap?.[currentProblem?._id]?.[language] || languageBoilerplates[language]);

  useEffect(() => {
    mobileCodeRef.current = reduxCode;
  }, [reduxCode]);

  // ─── Desktop: controlled via Redux (works fine) ───────────────────────────
  const handleCodeChange = (newCode) => {
    if (isGuest) return;
    dispatch(updateCodeLocally({ problemId: currentProblem._id, language, code: newCode }));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      dispatch(saveCodeToDB({ problemId: currentProblem._id, language, code: newCode }));
    }, 2000);
  };

  // ─── Mobile: update ref only, debounce save — never touches Redux mid-type ─
  const handleMobileCodeChange = (newCode) => {
    if (isGuest) return;
    mobileCodeRef.current = newCode;
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      // Write to Redux + save to DB only after user pauses typing
      dispatch(updateCodeLocally({ problemId: currentProblem._id, language, code: newCode }));
      dispatch(saveCodeToDB({ problemId: currentProblem._id, language, code: newCode }));
    }, 2000);
  };

  const backendLanguageMap = { python: "py", javascript: "js", cpp: "cpp", c: "c" };

  const handleRun = () => {
    if (isGuest) return;
    setIsOutputMode(true);
    // Use mobileCodeRef on mobile, Redux code on desktop
    const isMobile = window.innerWidth < 768;
    const codeToRun = isMobile ? mobileCodeRef.current : reduxCode;
    dispatch(runAllTestCases({ code: codeToRun, language: backendLanguageMap[language] || language, testCases }));
  };

  const handleSubmit = () => {
    if (isGuest) return;
    const isMobile = window.innerWidth < 768;
    const codeToSubmit = isMobile ? mobileCodeRef.current : reduxCode;
    dispatch(submitCode({ problemId: currentProblem._id, code: codeToSubmit, language: backendLanguageMap[language] || language }))
      .then(() => dispatch(fetchSubmissionsByProblem(number)));
  };

  if (problemLoading) return <LoadingScreen />;
  if (problemError) return (
    <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 text-red-400">{problemError}</div>
  );
  if (!currentProblem) return null;

  const sharedProps = {
    activeTab, setActiveTab,
    currentProblem, userSubmissions,
    loading: codeLoading, error,
    navigate, isSolved,
    language, setLanguage,
    // Desktop gets controlled Redux code; mobile gets the initial value only
    code: reduxCode,
    handleRun, handleSubmit,
    // Desktop handler (Redux-controlled)
    handleCodeChange,
    // Mobile handler (ref-only, no Redux mid-type)
    handleMobileCodeChange,
    verdict, failedCase, averageTime, lastAction,
    testCases, setTestCases,
    activeTestCaseIdx, setActiveTestCaseIdx,
    testCaseResults, isOutputMode, setIsOutputMode,
  };

  return (
    <div ref={containerRef} className="w-screen h-screen md:flex bg-zinc-950 text-white overflow-hidden">
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
  );
};

export default ProblemDetailsPage;