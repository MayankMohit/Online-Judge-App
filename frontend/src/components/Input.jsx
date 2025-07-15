import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const Input = ({ icon: Icon, type, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (showPassword ? "text" : "password") : type;

  return (
    <div className="relative mb-6">
      {/* Leading Icon */}
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <Icon className="text-purple-600" />
      </div>

      {/* Input Field */}
      <input
        {...props}
        type={inputType}
        className="w-full pr-10 py-2 pl-10 bg-gray-800 bg-opacity-50 rounded-lg border
          border-gray-700 focus:border-purple-500 focus:ring-2 focus:ring-purple-500
          text-white placeholder-gray-400 transition duration-200"
      />

      {/* Toggle Visibility Icon */}
      {isPassword && (
        <button
          type="button"
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 flex items-center px-3 text-purple-400 hover:text-purple-300 focus:outline-none"
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      )}
    </div>
  );
};

export default Input;
