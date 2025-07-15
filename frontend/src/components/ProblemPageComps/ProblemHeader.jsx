import { CircleCheckBig } from "lucide-react";

const difficultyColors = {
  Easy: "text-green-400 bg-green-950",
  Medium: "text-yellow-400 bg-yellow-950",
  Hard: "text-red-400 bg-red-950",
};

const ProblemHeader = ({
  problemNumber,
  title,
  difficulty,
  tags,
  isSolved,
}) => (
  <div className="flex items-center gap-4 mb-4">
    <div>
      <h1 className="text-2xl font-bold flex justify-between mb-2 gap-20">
        {problemNumber}. {title}
        {isSolved && <CircleCheckBig className="text-green-400" />}
      </h1>
      <div className="flex items-center gap-2 mt-1">
        <span
          className={`px-2 py-1 rounded text-xs ${difficultyColors[difficulty] || "text-gray-400 bg-gray-700"}`}
        >
          {difficulty}
        </span>
        {tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 items-center ml-5">
            Topics:
            {tags.map((tag, i) => (
              <span
                key={i}
                className="bg-gray-800 text-purple-400 px-2 py-1 rounded text-xs capitalize"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
);

export default ProblemHeader;