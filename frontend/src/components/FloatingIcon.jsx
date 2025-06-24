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
        damping: 30,
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
  }, [controls, delay, rotation]);

  return (
    <motion.div
        className={`z-10 h-[${size}%] w-[${size}%] absolute pointer-events-none`}
        style={{ top, left }}
        initial={{ y: `${10000/size}%`, rotate: 5*rotation }}
        animate={controls}
    >
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain" />
    </motion.div>
  )
}

export default FloatingIcon