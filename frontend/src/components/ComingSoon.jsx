const ComingSoon = ({ title, description, features = [] }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] w-screen px-4 text-center select-none">
      {/* Badge */}
      <div className="mb-6 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-semibold uppercase tracking-widest">
        Coming Soon
      </div>

      {/* Title */}
      <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight">
        {title}
      </h1>

      {/* Description */}
      <p className="text-zinc-400 text-base sm:text-lg max-w-md mb-10 leading-relaxed">
        {description || "This feature is currently in development. Check back soon."}
      </p>

      {/* Feature preview list */}
      {features.length > 0 && (
        <div className="flex flex-col gap-2 max-w-xs w-full mb-10">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3 bg-zinc-900 border border-zinc-800 rounded-xl text-sm text-zinc-400 text-left">
              <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0" />
              {f}
            </div>
          ))}
        </div>
      )}

      {/* Subtle divider line */}
      <div className="w-16 h-px bg-zinc-800" />
    </div>
  );
};

export default ComingSoon;