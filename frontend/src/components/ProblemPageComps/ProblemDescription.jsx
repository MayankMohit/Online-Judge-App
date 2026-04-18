import TestCase from "./TestCase";
import ExplainPanel from "./ExplainPanel";

const Section = ({ title, children }) => (
  <div className="mb-5">
    <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{title}</h3>
    {children}
  </div>
);

const ProblemDescription = ({ description, inputFormat, outputFormat, constraints, visibleTestCases, problem, isGuest }) => (
  <>
    <div className="text-zinc-300 whitespace-pre-wrap mb-6 text-sm leading-relaxed">
      {description}
    </div>

    <Section title="Input Format">
      <p className="text-zinc-400 whitespace-pre-wrap text-sm leading-relaxed">{inputFormat}</p>
    </Section>

    <Section title="Output Format">
      <p className="text-zinc-400 whitespace-pre-wrap text-sm leading-relaxed">{outputFormat}</p>
    </Section>

    <Section title="Constraints">
      <p className="text-zinc-400 whitespace-pre-wrap text-sm font-mono leading-relaxed">{constraints}</p>
    </Section>

    <Section title="Examples">
      {visibleTestCases?.length ? (
        visibleTestCases.map((tc, i) => (
          <TestCase key={i} input={tc.input} output={tc.expectedOutput} />
        ))
      ) : (
        <p className="text-zinc-600 italic text-sm">No sample input/output.</p>
      )}
    </Section>

    {/* AI Explanation — sits below examples inside description tab */}
    <ExplainPanel problem={problem} isGuest={isGuest} />
  </>
);

export default ProblemDescription;