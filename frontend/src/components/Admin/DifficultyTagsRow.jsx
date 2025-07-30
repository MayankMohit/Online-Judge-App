import TagSelect from "../TagSelect";

export default function DifficultyTagsRow({ problem, setProblem, formErrors, existingTags }) {
  return (
    <div className="flex sm:flex-row flex-col gap-2">
      <div className="flex items-center gap-2">
        <label className="text-sm sm:w-34 w-23">
          Difficulty <span className="text-red-500">*</span>
        </label>
        <select
          className={`flex-1 bg-gray-700 rounded-lg p-2 sm:max-w-37 ${
            formErrors.difficulty ? "border border-red-500" : ""
          }`}
          value={problem.difficulty}
          onChange={(e) => setProblem({ ...problem, difficulty: e.target.value })}
        >
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
      </div>

      <div className="flex flex-row items-center sm:ml-20 w-full">
        <label className="text-sm sm:w-20 w-35">
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
