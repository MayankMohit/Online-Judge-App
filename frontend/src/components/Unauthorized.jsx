import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gray-900 opacity-70 text-white text-center px-4">
      <h1 className="text-4xl font-bold text-red-500 mb-4">403 - Unauthorized</h1>
      <p className="mb-6 text-lg text-gray-300">
        You do not have permission to access this page.
      </p>
      <button onClick={() => navigate(-1)} className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-md">
        Go Back
      </button>
    </div>
  );
};

export default Unauthorized;
