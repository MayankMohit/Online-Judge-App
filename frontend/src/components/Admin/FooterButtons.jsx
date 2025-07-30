import { Trash2 } from "lucide-react";

export default function FooterButtons({
  isEditing,
  onDelete,
  onResetToOriginal,
  onClearAll,
  onSubmit,
}) {
  return (
    <div className="flex justify-between">
      <div className="flex gap-4">
        {isEditing && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-white hover:bg-red-500 border border-red-500 hover-border-red-600 transition-all sm:px-3 sm:py-2 rounded-lg sm:w-45 w-25"
          >
            <Trash2 size={20} className="inline mr-2 mb-1" />
            Delete <span className="sm:inline hidden">Problem</span>
          </button>
        )}
        {!isEditing && (
          <button
            onClick={onClearAll}
            className="text-yellow-500 border border-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600 hover:text-gray-200 transition-all"
          >
            Clear All
          </button>
        )}
      </div>
      <button
        onClick={onSubmit}
        className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg"
      >
        {isEditing ? "Save Changes" : "Add Problem"}
      </button>
    </div>
  );
}
