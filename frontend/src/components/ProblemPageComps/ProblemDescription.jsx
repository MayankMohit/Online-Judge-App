import TestCase from "./TestCase";

const ProblemDescription = ({
  description,
  inputFormat,
  outputFormat,
  constraints,
  visibleTestCases,
}) => (
  <>
    <div className="text-gray-300 whitespace-pre-wrap mb-6 text-lg">
      {description}
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Input Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{inputFormat}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Output Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{outputFormat}</p>
    </div>
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-2">Constraints</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{constraints}</p>
    </div>
    <h2 className="text-lg font-semibold mb-3">Sample Input Output</h2>
    {visibleTestCases?.length ? (
      visibleTestCases.map((tc, i) => (
        <TestCase key={i} input={tc.input} output={tc.expectedOutput} />
      ))
    ) : (
      <p className="text-gray-500 italic">No sample input/output.</p>
    )}
  </>
);

export default ProblemDescription; 