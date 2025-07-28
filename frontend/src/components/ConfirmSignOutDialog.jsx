import { useEffect } from "react";

export default function ConfirmSignOutDialog({ open, onClose, onConfirm }) {
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="bg-gray-900 text-white w-full max-w-md p-6 rounded-xl shadow-xl scale-100 animate-grow">
        <h2 className="mb-6 text-lg text-gray-200">
          Are you sure you want to <span className="font-semibold text-red-400">sign out</span>?
        </h2>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600 transition"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded font-semibold bg-red-700 hover:bg-red-600 transition"
            onClick={onConfirm}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
