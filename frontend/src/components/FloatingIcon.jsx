import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';

const FloatingIcon = ({ url, top, left, rotation, delay, size = 20 }) => {
  const iconRef = useRef();

  useEffect(() => {
    const el = iconRef.current;

    // Set initial position
    gsap.set(el, {
      y: `${10000 / size}%`,
      rotation: getRandomRotation(),
    });

    // Step 1: Float in with spring-like motion
    gsap.to(el, {
      y: "0%",
      rotation: rotation,
      delay,
      duration: 2.5,
      ease: "elastic.out(1, 0.75)", // spring-like
      onComplete: () => {
        // Step 2: Rotate back and forth forever
        gsap.to(el, {
          rotation: -rotation,
          duration: 5,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut",
          repeatDelay: 1,
        });
      }
    });
  }, [rotation, delay, size]);

  const getRandomRotation = () => {
    const angles = [-300, -200, -100, 100, 200, 300];
    return angles[Math.floor(Math.random() * angles.length)];
  };

  const sizeClass = {
    10: "h-[10%] w-[10%]",
    20: "h-[20%] w-[20%]",
  }[size] || "h-[20%] w-[20%]";

  return (
    <div
      ref={iconRef}
      className={clsx("z-10 absolute pointer-events-none", sizeClass)}
      style={{ top, left }}
    >
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain" />
    </div>
  );
};

export default FloatingIcon;
