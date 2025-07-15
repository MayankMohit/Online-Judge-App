const TestCase = ({ input, output }) => (
  <div className="bg-gray-800 p-3 rounded mb-4">
    <div className="mb-1">
      <span className="text-purple-400 font-medium">Input:</span>
      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {input}
      </pre>
    </div>
    <div>
      <span className="text-purple-400 font-medium">Output:</span>
      <pre className="bg-gray-900 p-2 mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {output}
      </pre>
    </div>
  </div>
);

export default TestCase;