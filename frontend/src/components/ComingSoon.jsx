import { motion } from "framer-motion";
import stop from "../assets/images/stop.png";

const ComingSoon = ({ title }) => {
  return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.5 }}
        className="flex min-w-screen pt-30 sm:flex-row flex-col items-center justify-center max-h-[calc(100vh-9rem)]"
      >
      <div className="">
        <img src={stop} alt="Under Construction" className="sm:w-2xl w-[18rem] drop-shadow-lg drop-shadow-amber-100/40 " />
      </div>
      <div className=" flex flex-col items-center justify-center text-center px-4">
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-gray-300 text-2xl md:text-3xl font-bold mb-4"
        >
          <span className="text-3xl md:text-4xl font-bold text-purple-400 mb-4">
            {title}
          </span>{" "}
          is under construction!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-gray-400 sm:text-2xl text-left text-lg"
        >
          Stay tuned for updates!
        </motion.p>
      </div>
    </motion.div>
  );
};

export default ComingSoon;
