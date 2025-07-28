import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";

// Slice Imports
import {
  fetchProblemByNumber,
  clearCurrentProblem,
} from "../../features/problems/problemsSlice";
import {
  fetchSubmissionsByProblem,
  clearProblemSubmissions,
} from "../../features/submissions/problemSubmissionsSlice";
import {
  runCode,
  submitCode,
  clearCodeState,
} from "../../features/code/codeSlice";
import {
  fetchSavedCode,
  saveCodeToDB,
  updateCodeLocally,
} from "../../features/code/codePersistenceSlice";

import { languageBoilerplates } from "../../components/ProblemPageComps/LanguageBoilerplates";
import MobileProblemView from "../../components/ProblemPageComps/MobileProblemView";
import DesktopProblemView from "../../components/ProblemPageComps/DesktopProblemView";

const ProblemDetailsPage = () => {
  // Layout state
  const [leftWidth, setLeftWidth] = useState(35);
  const containerRef = useRef(null);
  const [editorHeight, setEditorHeight] = useState(70);
  const [testcaseHeight, setTestcaseHeight] = useState(30);
  const mobileScrollRef = useRef(null);
  const [isOutputVisible, setIsOutputVisible] = useState(false);
  const saveTimeout = useRef(null);

  // Problem state
  const [activeTab, setActiveTab] = useState("description");
  const [customInput, setCustomInput] = useState("");
  const [language, setLanguage] = useState("cpp");
  const { codeMap } = useSelector((state) => state.codePersistence);

  const { number } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { currentProblem, problemLoading, problemError } = useSelector(
    (state) => state.problems
  );
  const {
    items: userSubmissions,
    loading: submissionsLoading,
    error,
  } = useSelector((state) => state.problemSubmissions);
  const {
    output,
    loading: codeLoading,
    error: codeError,
    time,
    verdict,
    failedCase,
    averageTime,
    lastAction,
  } = useSelector((state) => state.code);

  // Load submissions
  useEffect(() => {
    dispatch(fetchSubmissionsByProblem(number));
    return () => dispatch(clearProblemSubmissions());
  }, [dispatch, number]);

  const isSolved = userSubmissions.some((sub) => sub.verdict === "accepted");

  // Load problem & reset code state
  useEffect(() => {
    dispatch(fetchProblemByNumber(number));
    dispatch(clearCodeState()); // Reset run/submit state
    setIsOutputVisible(false); // Ensure OutputTab is closed
    setActiveTab("description"); // Reset to description tab
    return () => dispatch(clearCurrentProblem());
  }, [dispatch, number]);

  // Show OutputTab only if there is new output or submission result
  useEffect(() => {
    if (output || verdict || codeError) {
      setIsOutputVisible(true);
    }
  }, [output, verdict, codeError]);

  const code =
    codeMap?.[currentProblem?._id]?.[language] ||
    languageBoilerplates[language];

  useEffect(() => {
    if (currentProblem?._id && language) {
      dispatch(fetchSavedCode({ problemId: currentProblem._id, language }));
    }
  }, [currentProblem?._id, language]);

  const handleCodeChange = (newCode) => {
    dispatch(
      updateCodeLocally({
        problemId: currentProblem._id,
        language,
        code: newCode,
      })
    );

    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
    }

    saveTimeout.current = setTimeout(() => {
      dispatch(
        saveCodeToDB({ problemId: currentProblem._id, language, code: newCode })
      );
    }, 2000);
  };

  const backendLanguageMap = {
    python: "py",
    javascript: "js",
    cpp: "cpp",
    c: "c",
  };

  const handleRun = () => {
    dispatch(
      runCode({
        code,
        language: backendLanguageMap[language] || language,
        input: customInput.trim() === "" ? "0\n" : customInput,
      })
    );
  };

  const handleSubmit = () => {
    dispatch(
      submitCode({
        problemId: currentProblem._id,
        code,
        language: backendLanguageMap[language] || language,
      })
    ).then(() => {
      dispatch(fetchSubmissionsByProblem(number));
    });
  };

  if (problemLoading)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 border-opacity-60"></div>
      </div>
    );

  if (problemError)
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-gray-900">
        <div className="text-red-500 text-lg">{problemError}</div>
      </div>
    );

  if (!currentProblem) return null;

  return (
    <div
      ref={containerRef}
      className="w-screen h-screen md:flex bg-gray-900 text-white overflow-hidden"
    >
      <MobileProblemView
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProblem={currentProblem}
        userSubmissions={userSubmissions}
        loading={codeLoading}
        error={error}
        navigate={navigate}
        isSolved={isSolved}
        language={language}
        setLanguage={setLanguage}
        code={code}
        customInput={customInput}
        setCustomInput={setCustomInput}
        handleRun={handleRun}
        handleSubmit={handleSubmit}
        output={output}
        codeError={codeError}
        verdict={verdict}
        failedCase={failedCase}
        averageTime={averageTime}
        time={lastAction === "run" ? null : time}
        mobileScrollRef={mobileScrollRef}
        handleCodeChange={handleCodeChange}
        lastAction={lastAction}
        isOutputVisible={isOutputVisible}
        setIsOutputVisible={setIsOutputVisible}
      />

      <DesktopProblemView
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentProblem={currentProblem}
        userSubmissions={userSubmissions}
        loading={codeLoading}
        error={error}
        navigate={navigate}
        isSolved={isSolved}
        language={language}
        setLanguage={setLanguage}
        code={code}
        customInput={customInput}
        setCustomInput={setCustomInput}
        handleRun={handleRun}
        handleSubmit={handleSubmit}
        output={output}
        codeError={codeError}
        verdict={verdict}
        failedCase={failedCase}
        averageTime={averageTime}
        time={lastAction === "run" ? null : time}
        isOutputVisible={isOutputVisible}
        setIsOutputVisible={setIsOutputVisible}
        editorHeight={editorHeight}
        testcaseHeight={testcaseHeight}
        setEditorHeight={setEditorHeight}
        setTestcaseHeight={setTestcaseHeight}
        containerRef={containerRef}
        leftWidth={leftWidth}
        setLeftWidth={setLeftWidth}
        handleCodeChange={handleCodeChange}
        lastAction={lastAction}
      />
    </div>
  );
};

export default ProblemDetailsPage;
