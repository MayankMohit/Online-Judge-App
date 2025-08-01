export default function TitleStatementFields({ problem, handleChange, formErrors }) {
  return (
    <>
      {/* Title */}
      <div className="flex items-center gap-4">
        <label className="sm:w-32 w-21 text-sm">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          className={`flex-1 bg-gray-700 rounded-lg p-2 ${
            formErrors.title ? "border border-red-500" : ""
          }`}
          value={problem.title}
          onChange={(e) => handleChange("title", e.target.value)}
        />
      </div>

      {/* Statement */}
      <div className="flex sm:gap-4">
        <label className="sm:w-32 w-25 text-sm">
          Statement <span className="text-red-500">*</span>
        </label>
        <textarea
          className={`flex-1 bg-gray-700 rounded-lg p-2 sm:h-[100px] resize-none custom-scrollbar ${
            formErrors.statement ? "border border-red-500" : ""
          }`}
          value={problem.statement}
          onChange={(e) => handleChange("statement", e.target.value)}
        />
      </div>
    </>
  );
}
