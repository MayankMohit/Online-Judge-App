import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import gsap from 'gsap';

const FloatingIcon = ({ url, top, left, rotation, delay, size = 20 }) => {
  const iconRef = useRef();

  useEffect(() => {
    const el = iconRef.current;

    // Unique seed per icon for varied motion
    const floatRange   = 6 + Math.random() * 8;   // px to drift up/down
    const swayRange    = 4 + Math.random() * 6;    // px to drift left/right
    const floatDur     = 3.5 + Math.random() * 2;  // seconds per float cycle
    const swayDur      = 4.5 + Math.random() * 3;  // seconds per sway cycle
    const tiltAmount   = 4 + Math.random() * 5;    // subtle tilt degrees
    const tiltDur      = 4 + Math.random() * 3;
    const scaleAmount  = 0.03 + Math.random() * 0.03; // subtle breathe

    // Start off-screen at bottom
    gsap.set(el, {
      y: '120vh',
      x: 0,
      rotation: rotation * 3,
      opacity: 0,
      scale: 0.6,
    });

    // Fly in: arc up from bottom with spring
    gsap.to(el, {
      y: 0,
      x: 0,
      rotation,
      opacity: 1,
      scale: 1,
      delay,
      duration: 2.2,
      ease: 'expo.out',
      onComplete: startIdleMotion,
    });

    function startIdleMotion() {
      // Continuous vertical float
      gsap.to(el, {
        y: `-${floatRange}px`,
        duration: floatDur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
      });

      // Independent horizontal sway — offset phase so it's not synced with float
      gsap.to(el, {
        x: `${swayRange}px`,
        duration: swayDur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: swayDur * 0.4,
      });

      // Subtle slow tilt that's independent of float/sway
      gsap.to(el, {
        rotation: rotation + tiltAmount,
        duration: tiltDur,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: tiltDur * 0.2,
      });

      // Very subtle scale "breathe"
      gsap.to(el, {
        scale: 1 + scaleAmount,
        duration: floatDur * 1.3,
        repeat: -1,
        yoyo: true,
        ease: 'sine.inOut',
        delay: floatDur * 0.6,
      });
    }

    return () => {
      gsap.killTweensOf(el);
    };
  }, [rotation, delay, size]);

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
      <img src={url} alt="Floating Icon" className="w-full h-full object-contain drop-shadow-lg" />
    </div>
  );
};

export default FloatingIcon;