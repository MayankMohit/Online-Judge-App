import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

import { fetchProblemByNumber, clearCurrentProblem } from "../../features/problems/problemsSlice";
import { fetchSubmissionsByProblem, clearProblemSubmissions } from "../../features/submissions/problemSubmissionsSlice";
import { runAllTestCases, submitCode, clearCodeState } from "../../features/code/codeSlice";
import { fetchSavedCode, saveCodeToDB, updateCodeLocally } from "../../features/code/codePersistenceSlice";

import { languageBoilerplates } from "../../components/ProblemPageComps/LanguageBoilerplates";
import MobileProblemView from "../../components/ProblemPageComps/MobileProblemView";
import DesktopProblemView from "../../components/ProblemPageComps/DesktopProblemView";
import LoadingScreen from "../../components/LoadingScreen";

// Build initial test cases from problem's visible (non-hidden) test cases
const buildInitialTestCases = (problem) => {
  const visible = problem?.testCases?.filter((tc) => !tc.isHidden) || [];
  if (visible.length === 0) {
    return [{ id: Date.now(), label: "Case 1", input: "" }];
  }
  return visible.map((tc, i) => ({
    id: tc._id || i,
    label: `Case ${i + 1}`,
    input: tc.input || "",
  }));
};

const ProblemDetailsPage = () => {
  const [leftWidth, setLeftWidth] = useState(38);
  const containerRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(65);
  const [testcaseHeight, setTestcaseHeight] = useState(35);
  const mobileScrollRef = useRef(null);
  const saveTimeout = useRef(null);

  const [activeTab, setActiveTab] = useState("description");
  const [language, setLanguage] = useState("cpp");
  const [isOutputMode, setIsOutputMode] = useState(false); // false=testcase, true=output

  // Test cases state — array of { id, label, input }
  const [testCases, setTestCases] = useState([{ id: 1, label: "Case 1", input: "" }]);
  const [activeTestCaseIdx, setActiveTestCaseIdx] = useState(0);

  const { codeMap } = useSelector((state) => state.codePersistence);
  const { number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProblem, problemLoading, problemError } = useSelector((state) => state.problems);
  const { items: userSubmissions, loading: submissionsLoading, error } = useSelector((state) => state.problemSubmissions);
  const { loading: codeLoading, verdict, failedCase, averageTime, lastAction, testCaseResults } = useSelector((state) => state.code);

  // Load submissions
  useEffect(() => {
    dispatch(fetchSubmissionsByProblem(number));
    return () => dispatch(clearProblemSubmissions());
  }, [dispatch, number]);

  const isSolved = userSubmissions.some((sub) => sub.verdict === "accepted");

  // Load problem & reset state
  useEffect(() => {
    dispatch(fetchProblemByNumber(number));
    dispatch(clearCodeState());
    setIsOutputMode(false);
    setActiveTab("description");
    return () => dispatch(clearCurrentProblem());
  }, [dispatch, number]);

  // Auto-fill test cases from problem's visible test cases once loaded
  useEffect(() => {
    if (currentProblem) {
      const initial = buildInitialTestCases(currentProblem);
      setTestCases(initial);
      setActiveTestCaseIdx(0);
    }
  }, [currentProblem?._id]);

  // Switch to output mode when results come in
  useEffect(() => {
    if (testCaseResults?.length > 0 || verdict || lastAction === "submit") {
      setIsOutputMode(true);
    }
  }, [testCaseResults, verdict, lastAction]);

  const code = codeMap?.[currentProblem?._id]?.[language] || languageBoilerplates[language];

  useEffect(() => {
    if (currentProblem?._id && language) {
      dispatch(fetchSavedCode({ problemId: currentProblem._id, language }));
    }
  }, [currentProblem?._id, language]);

  const handleCodeChange = (newCode) => {
    dispatch(updateCodeLocally({ problemId: currentProblem._id, language, code: newCode }));
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      dispatch(saveCodeToDB({ problemId: currentProblem._id, language, code: newCode }));
    }, 2000);
  };

  const backendLanguageMap = { python: "py", javascript: "js", cpp: "cpp", c: "c" };

  const handleRun = () => {
    setIsOutputMode(true);
    dispatch(runAllTestCases({
      code,
      language: backendLanguageMap[language] || language,
      testCases,
    }));
  };

  const handleSubmit = () => {
    dispatch(submitCode({
      problemId: currentProblem._id,
      code,
      language: backendLanguageMap[language] || language,
    })).then(() => {
      dispatch(fetchSubmissionsByProblem(number));
    });
  };

  if (problemLoading) return (
    <LoadingScreen />
  );

  if (problemError) return (
    <div className="w-screen h-screen flex items-center justify-center bg-zinc-950 text-red-400">
      {problemError}
    </div>
  );

  if (!currentProblem) return null;

  const sharedProps = {
    activeTab, setActiveTab,
    currentProblem, userSubmissions,
    loading: codeLoading, error,
    navigate, isSolved,
    language, setLanguage,
    code,
    handleRun, handleSubmit,
    handleCodeChange,
    verdict, failedCase, averageTime,
    lastAction,
    // Test case panel props
    testCases, setTestCases,
    activeTestCaseIdx, setActiveTestCaseIdx,
    testCaseResults,
    isOutputMode, setIsOutputMode,
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