import TestCase from "./TestCase";

const ProblemDescription = ({
  description,
  inputFormat,
  outputFormat,
  constraints,
  visibleTestCases,
}) => (
  <>
    <div className="text-gray-300 whitespace-pre-wrap mb-6 sm:text-lg text-[16px]">
      {description}
    </div>
    <div className="sm:mb-6 mb-3">
      <h3 className="sm:text-lg text-[16px] font-semibold sm:mb-2 mb-0">Input Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{inputFormat}</p>
    </div>
    <div className="sm:mb-6 mb-3">
      <h3 className="sm:text-lg text-[16px] font-semibold sm:mb-2 mb-0">Output Format</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{outputFormat}</p>
    </div>
    <div className="sm:mb-6 mb-3">
      <h3 className="sm:text-lg text-[16px] font-semibold sm:mb-2 mb-0">Constraints</h3>
      <p className="text-gray-400 whitespace-pre-wrap">{constraints}</p>
    </div>
    <h2 className="sm:text-lg text-[16px] font-semibold mb-3">Sample Input Output</h2>
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