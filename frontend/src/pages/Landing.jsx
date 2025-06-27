import { Link } from "react-router-dom";
import Logo from "../assets/images/dark_long.png";
import Grid from "../assets/images/grid.png";
import FloatingIcon from "../components/FloatingIcon";
import {
  JavaIcon, PythonIcon, CppIcon, CsharpIcon,
  JsIcon, GoIcon, SwiftIcon, TsIcon, PhpIcon
} from "../utils/Icons";

const Landing = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden sm:bg-radial-[at_50%_30%] sm:from-purple-800 sm:via-purple-950 sm:to-black bg-gradient-to-b from-black to-purple-900">
      <div
        className="absolute inset-0 z-0 bg-cover opacity-15 pointer-events-none -top-10 -left-10 -right-10"
        style={{ backgroundImage: `url(${Grid})` }}
      ></div>
      <FloatingIcon url={JavaIcon} top="45%" left="63%" rotation={5} delay={0} />
      <FloatingIcon url={PythonIcon} top="15%" left="5%" rotation={-10} delay={0.3} />
      <FloatingIcon url={CppIcon} top="10%" left="75%" rotation={-5} delay={0.5} />
      <FloatingIcon url={JsIcon} top="70%" left="15%" rotation={8} delay={0.1} />
      <FloatingIcon url={CsharpIcon} top="23%" left="30%" rotation={-5} delay={0.4} size={10} />
      <FloatingIcon url={GoIcon} top="70%" left="86%" rotation={10} delay={0.2} size={10} />
      <FloatingIcon url={SwiftIcon} top="60%" left="5%" rotation={-8} delay={0.6} size={10} />
      <FloatingIcon url={TsIcon} top="10%" left="60%" rotation={5} delay={0.7} size={10} />
      <FloatingIcon url={PhpIcon} top="85%" left="70%" rotation={-10} delay={0.8} size={10} />
      <div className="relative z-30 flex flex-col items-center h-full justify-center">
        <img src={Logo} alt="Logo" className="pointer-events-none h-[60%]" />
        <Link to="/signup">
          <button className="px-15 py-2 text-2xl bg-purple-400 text-black rounded-4xl hover:bg-purple-300 transition">
            Get Started
          </button>
        </Link>
        <p className="mt-4 text-zinc-400">
          Already have an account?
          <Link to="/login" className="ml-1 underline hover:text-gray-300">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Landing;
