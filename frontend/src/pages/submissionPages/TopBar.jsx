import { ArrowLeft } from "lucide-react";

const TopBar = ({ title, onBack, rightContent }) => {
  return (
    <div className="sticky top-0 z-50 w-full bg-black border-b border-zinc-800 px-6 py-4 grid grid-cols-3 items-center">
      
      {/* Left */}
      <div className="flex items-center">
        {onBack ? (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition text-sm"
          >
            <ArrowLeft size={16} />
            Back
          </button>
        ) : (
          <div />
        )}
      </div>

      {/* Center */}
      <h1 className="text-center text-base font-semibold text-white">
        {title}
      </h1>

      {/* Right */}
      <div className="flex items-center justify-end">
        {rightContent || null}
      </div>
    </div>
  );
};

export default TopBar;