const TabButton = ({ active, onClick, children }) => (
  <button
    className={`px-3 rounded text-xs font-medium transition-colors py-2 ${
      active
        ? "bg-purple-900 text-gray-300 py-2.5"
        : "bg-gray-900 text-gray-400 hover:bg-gray-700"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton;