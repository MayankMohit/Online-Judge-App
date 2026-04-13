const TestCase = ({ input, output }) => (
  <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 mb-3">
    <div className="mb-2">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Input</span>
      <pre className="bg-black/40 border border-zinc-800 p-2 mt-1.5 rounded-lg text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto custom-scrollbar font-mono">
        {input}
      </pre>
    </div>
    <div>
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Output</span>
      <pre className="bg-black/40 border border-zinc-800 p-2 mt-1.5 rounded-lg text-sm text-zinc-300 whitespace-pre-wrap overflow-x-auto custom-scrollbar font-mono">
        {output}
      </pre>
    </div>
  </div>
);

export default TestCase;