import { motion } from 'framer-motion';

const FloatingIcon = ({url, top, left, rotation, delay}) => {
  return (
    <motion.div
        className="z-10 h-[20%] w-[20%] absolute pointer-events-none"
        style={{ top, left }}
        initial={{ y: "-500%", rotate: 5*rotation }}
        animate={{ y: "0%", rotate: rotation }}
        transition={{
            duration: 2,
            // ease: "power2.out",
            type: "spring",
            stiffness: 100,
            damping: 50,
            delay
        }}
    >
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain" />
    </motion.div>
  )
}

export default FloatingIcon