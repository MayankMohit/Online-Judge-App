import { Link } from "react-router-dom";
import Logo from "../assets/images/dark_long.png";
import Grid from "../assets/images/grid.png";
import FloatingIcon from "../components/FloatingIcon";
import Java from "../assets/coding-icons/java.png";
import Python from "../assets/coding-icons/python.png";
import Cpp from "../assets/coding-icons/c++.png";
import Js from "../assets/coding-icons/node.png";
import Csharp from "../assets/coding-icons/c-sharp.png";
import Go from "../assets/coding-icons/go-lang.png";
import Swift from "../assets/coding-icons/swift.png";
import Ts from "../assets/coding-icons/typescript.png";
import Php from "../assets/coding-icons/web.png";

const Landing = () => {
  return (
    <div className="relative h-screen w-screen overflow-hidden sm:bg-radial-[at_50%_30%] sm:from-purple-800 sm:via-purple-950 sm:to-black bg-gradient-to-b from-black to-purple-900">
      <div
        className="absolute inset-0 z-0 bg-cover opacity-15 pointer-events-none -top-10 -left-10 -right-10"
        style={{ backgroundImage: `url(${Grid})` }}
      ></div>
        <FloatingIcon url={Java} top="45%" left="63%" rotation={5} delay={0} />
        <FloatingIcon url={Python} top="15%" left="5%" rotation={-10} delay={0.3} />
        <FloatingIcon url={Cpp} top="10%" left="75%" rotation={-5} delay={0.5} />
          <FloatingIcon url={Js} top="70%" left="15%" rotation={8} delay={0.1} />
        <FloatingIcon url={Csharp} top="23%" left="30%" size={10} rotation={-5} delay={0.4} />
        <FloatingIcon url={Go} top="70%" left="86%" size={10} rotation={10} delay={0.2} />
          <FloatingIcon url={Swift} top="60%" left="5%" size={10} rotation={-8} delay={0.6} />
          <FloatingIcon url={Ts} top="10%" left="60%" size={5} rotation={5} delay={0.7} />
        <FloatingIcon url={Php} top="85%" left="70%" size={10} rotation={-10} delay={0.8} />
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
