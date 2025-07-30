export default function ConfirmDeleteProblemDialog({ open, onClose, onConfirm, problemTitle }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-gray-800 text-white w-[90%] max-w-md p-6 rounded-xl shadow-xl animate-grow">
        <h2 className="mb-6 text-lg text-gray-200">
          Are you sure you want to <span className="text-red-500 font-bold">Delete this problem</span>?
        </h2>
        <div className="flex justify-end gap-3">
          <button className="px-4 py-2 text-sm bg-gray-700 rounded hover:bg-gray-600" onClick={onClose}>
            Cancel
          </button>
          <button className="px-4 py-2 text-sm rounded font-semibold bg-red-700 hover:bg-red-600" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
