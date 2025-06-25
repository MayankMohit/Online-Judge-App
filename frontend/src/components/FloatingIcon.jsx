import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';


const FloatingIcon = ({ url, top, left, size=20, rotation, delay }) => {
    
    const controls = useAnimation();

  useEffect(() => {
    // First: enter from top
    controls.start({
      y: "0%",
      rotate: rotation,
      transition: {
        duration: 2,
        type: "spring",
        stiffness: 100,
        damping: 40,
        delay,
      },
    }).then(() => {
      // Then: sway between -rotation and +rotation forever
      controls.start({
        rotate: [rotation, -rotation, rotation],
        transition: {
          duration: 10,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "loop",
          repeatDelay: 1,
        },
      });
    });
  }, [controls, rotation, delay]);
  const angle = [-300, -200, -100, 100, 200, 300]
  const random_rotation = angle[Math.floor(Math.random() * angle.length)];
  return (
    
    <motion.div
        className={`z-10 h-[${size}%] w-[${size}%] absolute pointer-events-none`}      // h-[${size}%] w-[${size}%]
        style={{ top, left }}
        initial={{ y: `${10000/size}%`, rotate: random_rotation }}
        animate={controls}
    >
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain" />
    </motion.div>
  )
}

export default FloatingIcon