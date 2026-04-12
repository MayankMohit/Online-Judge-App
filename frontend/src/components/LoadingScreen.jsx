const LoadingScreen = () => {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col items-center justify-center gap-4">
      <div className="relative w-14 h-14">
        <div className="absolute inset-0 rounded-full border-2 border-zinc-800" />
        <div className="absolute inset-0 rounded-full border-2 border-t-purple-500 animate-spin" />
      </div>
      <p className="text-zinc-500 text-sm tracking-widest uppercase animate-pulse">Loading</p>
    </div>
  );
};

export default LoadingScreen;