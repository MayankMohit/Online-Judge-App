export const cleanCompilerError = (rawError) => {
  if (!rawError) return "Unknown compilation error.";

  return rawError
    .split("\n")
    .map((line) => 
      line
        .replace(/([A-Z]:)?(\/|\\)[^\s]+\.((cpp)|(c)|(js)|(py)):\d+:\d+:/gi, "")
        .replace(/\s+/g, " ") 
        .trim()
    )
    .filter((line) => line && !line.includes("note:")) 
    .slice(0, 6)
    .join("\n");
};
