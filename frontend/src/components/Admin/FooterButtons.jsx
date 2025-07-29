import { Trash2 } from "lucide-react";

export default function FooterButtons({
  isEditing,
  onDelete,
  onResetToOriginal, 
  onClearAll,        
  onSubmit,
}) {
  return (
    <div className="flex justify-between mt-6">
      <div className="flex gap-4">
        {isEditing && (
          <button
            onClick={onDelete}
            className="text-red-500 hover:text-red-700 border border-red-500 px-3 py-2 rounded-lg"
          >
            <Trash2 size={20} className="inline mr-2" />
            Delete
          </button>
        )}
        <button
          onClick={isEditing ? onResetToOriginal : onClearAll}
          className="text-yellow-500 border border-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-600 hover:text-white"
        >
          {isEditing ? "Reset Changes" : "Clear All"}
        </button>
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
