import { motion, useAnimation } from 'framer-motion';
import { useEffect } from 'react';
import clsx from 'clsx';

const FloatingIcon = ({ url, top, left, rotation, delay, size = 20 }) => {
  
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

  const sizeClass = {
      10: "h-[10%] w-[10%]",
      20: "h-[20%] w-[20%]",
  }[size] || "h-[20%] w-[20%]"; 
  
  return (
    
    <motion.div
        className={clsx(
          "z-10 absolute pointer-events-none",
          sizeClass
        )}
        style={{ top, left }}
        initial={{ y: `${10000 / size}%`, rotate: random_rotation }}
        animate={controls}
    >
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain" />
    </motion.div>
  )
}

export default FloatingIcon