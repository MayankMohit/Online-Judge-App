import { Link } from "react-router-dom";
import { useSeo } from "../../hooks/otherHooks/useSeo";
import Logo from "../../assets/images/dark_long.png";
import Grid from "../../assets/images/grid.png";
import FloatingIcon from "../../components/FloatingIcon";
import {
  JavaIcon, PythonIcon, CppIcon, CsharpIcon,
  JsIcon, GoIcon, SwiftIcon, TsIcon, PhpIcon,
} from "../../utils/Icons";

const Landing = () => {
  useSeo({
    title: "Practice Coding Problems & Compete in Contests",
    description:
      "Code Junkie is a free online judge: solve programming problems in C++, Java, Python, JavaScript and more, get instant verdicts, enter timed contests, and climb the leaderboard.",
    path: "/",
  });

  return (

    <div className="relative h-screen w-screen overflow-hidden sm:bg-radial-[at_50%_30%] sm:from-purple-950 sm:to-black bg-gradient-to-b from-black to-purple-950">
      <div
        className="absolute inset-0 z-0 bg-cover opacity-15 pointer-events-none -top-10 -left-10 -right-10"
        style={{ backgroundImage: `url(${Grid})` }}
      />
      <FloatingIcon url={JavaIcon}   top="45%" left="63%" rotation={5}   delay={0}   />
      <FloatingIcon url={PythonIcon} top="15%" left="5%"  rotation={-10} delay={0.3} />
      <FloatingIcon url={CppIcon}    top="10%" left="75%" rotation={-5}  delay={0.5} />
      <FloatingIcon url={JsIcon}     top="70%" left="15%" rotation={8}   delay={0.1} />
      <FloatingIcon url={CsharpIcon} top="23%" left="30%" rotation={-5}  delay={0.4} size={10} />
      <FloatingIcon url={GoIcon}     top="70%" left="86%" rotation={10}  delay={0.2} size={10} />
      <FloatingIcon url={SwiftIcon}  top="60%" left="5%"  rotation={-8}  delay={0.6} size={10} />
      <FloatingIcon url={TsIcon}     top="10%" left="60%" rotation={5}   delay={0.7} size={10} />
      <FloatingIcon url={PhpIcon}    top="85%" left="70%" rotation={-10} delay={0.8} size={10} />

      <div className="relative z-30 flex flex-col items-center h-full justify-center gap-1">
        {/* The wordmark is an image, so without this heading the highest-value
            page on the site has no machine-readable text at all. */}
        <h1 className="sr-only">
          Code Junkie — practice coding problems and compete in contests
        </h1>
        <img
          src={Logo}
          alt="Code Junkie"
          className="pointer-events-none sm:h-[60%]"
        />

        <p className="max-w-xl px-6 text-center text-sm sm:text-base text-zinc-300">
          A free online judge. Solve programming problems in C++, Java, Python
          and JavaScript, get an instant verdict, enter timed contests, and
          track your progress on the leaderboard.
        </p>

        <Link to="/problems" className="mt-4">
          <button className="px-15 py-2 text-2xl bg-purple-400 text-black rounded-4xl hover:bg-purple-300 transition">
            Get Started
          </button>
        </Link>

        <div className="mt-4 flex items-center gap-3">
          <Link
            to="/login"
            className="px-5 py-1.5 text-sm rounded-full border border-zinc-600 text-zinc-300 hover:border-purple-400 hover:text-white transition"
          >
            Log In
          </Link>
          <span className="text-zinc-600 text-sm">or</span>
          <Link
            to="/signup"
            className="px-5 py-1.5 text-sm rounded-full border border-zinc-600 text-zinc-300 hover:border-purple-400 hover:text-white transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Landing;