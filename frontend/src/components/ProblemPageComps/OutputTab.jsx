import { motion, AnimatePresence } from "framer-motion";
import TestCase from "./TestCase";

const OutputTab = ({ output, error, verdict, failedCase, time, onClose }) => {
  const hasError = !!error;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.35 }}
        className="bg-gray-900 p-4 text-sm flex flex-col gap-3 overflow-y-auto hide-scrollbar border-t border-purple-900"
        style={{ height: "50%", minHeight: "200px" }}
      >
        <div className="flex justify-between items-center">
          <h3 className="text-purple-400 font-semibold text-lg">
            Output Result
          </h3>
          <button
            className="bg-gray-800 px-2 py-1 rounded text-purple-300 text-xs"
            onClick={onClose}
          >
            Show Input ↧
          </button>
        </div>

        {hasError ? (
          <div className="bg-red-950 text-red-400 p-2 rounded">{error}</div>
        ) : (
          <>
            {verdict && (
              <p className="text-gray-300">
                <span className="text-purple-400">Verdict:</span>{" "}
                <span
                  className={
                    verdict === "accepted" ? "text-green-400" : "text-red-400"
                  }
                >
                  {verdict}
                </span>
              </p>
            )}
            {typeof time === "number" && (
              <p className="text-gray-300">
                <span className="text-purple-400">Time Taken:</span> {time} ms
              </p>
            )}
            {failedCase && verdict !== "accepted" && !hasError && (
              <>
                <p className="text-purple-400 mt-2">Failed Test Case</p>
                <TestCase
                  input={failedCase.input}
                  output={failedCase.expectedOutput}
                />
              </>
            )}
            {output && (
              <>
                <p className="text-purple-400 mt-2">Program Output</p>
                <pre className="bg-gray-800 text-white p-2 rounded whitespace-pre-wrap overflow-x-auto hide-scrollbar">
                  {output}
                </pre>
              </>
            )}
          </>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

export default OutputTab;