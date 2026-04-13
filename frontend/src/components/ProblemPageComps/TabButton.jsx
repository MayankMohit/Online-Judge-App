const TabButton = ({ active, onClick, children }) => (
  <button
    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
      active
        ? "bg-zinc-700 text-white"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
    }`}
    onClick={onClick}
  >
    {children}
  </button>
);

export default TabButton;