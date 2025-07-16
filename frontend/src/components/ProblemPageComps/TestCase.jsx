const TestCase = ({ input, output }) => (
  <div className="bg-gray-800 sm:p-3 p-1.5 rounded sm:mb-4 mb-2">
    <div className="mb-1">
      <span className="text-purple-400 font-medium">Input:</span>
      <pre className="bg-gray-900 sm:p-2 p-1 sm:mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {input}
      </pre>
    </div>
    <div>
      <span className="text-purple-400 font-medium">Output:</span>
      <pre className="bg-gray-900 sm:p-2 p-1 sm:mt-1 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
        {output}
      </pre>
    </div>
  </div>
);

export default TestCase;