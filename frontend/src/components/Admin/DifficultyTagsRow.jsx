import TagSelect from "../TagSelect";

export default function DifficultyTagsRow({ problem, setProblem, formErrors, existingTags }) {
  return (
    <div className="flex">
      <div className="flex items-center gap-2 flex-1">
        <label className="text-sm w-34">
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          className={`flex-1 bg-gray-700 rounded-lg p-2 max-w-27 ${
            formErrors.difficulty ? "border border-red-500" : ""
          }`}
          value={problem.difficulty}
          onChange={(e) => setProblem({ ...problem, difficulty: e.target.value })}
        >
          <option value="">Select</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="flex flex-row flex-1">
        <label className="text-sm w-20 mt-1.5 -ml-15">
          Tags <span className="text-red-500">*</span>
        </label>
        <TagSelect
          selectedTags={problem.tags}
          allTags={existingTags}
          onChange={(tags) => setProblem({ ...problem, tags })}
          error={formErrors.tags}
        />
      </div>
    </div>
  );
}
