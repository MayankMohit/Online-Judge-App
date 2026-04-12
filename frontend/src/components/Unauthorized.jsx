import { useNavigate } from "react-router-dom";
import { ShieldOff, ArrowLeft } from "lucide-react";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black text-white text-center px-4">
      <div className="flex flex-col items-center gap-6 max-w-md">
        {/* Icon */}
        <div className="w-20 h-20 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
          <ShieldOff size={36} className="text-red-400" />
        </div>

        {/* Text */}
        <div className="flex flex-col gap-2">
          <h1 className="text-5xl font-bold text-red-500">403</h1>
          <h2 className="text-xl font-semibold text-white">Access Denied</h2>
          <p className="text-zinc-400 text-sm leading-relaxed">
            You don't have permission to view this page. This area is restricted to admins only.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 hover:text-white transition text-sm"
          >
            <ArrowLeft size={15} />
            Go Back
          </button>
          <button
            onClick={() => navigate("/problems")}
            className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition text-sm font-medium"
          >
            Go to Problems
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;