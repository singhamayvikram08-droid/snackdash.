import { useRef } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const Magnetic = ({ children, strength = 0.25, className = '' }: { children: React.ReactNode, strength?: number, className?: string }) => {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springConfig = { damping: 15, stiffness: 150, mass: 1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    const center = { x: left + width / 2, y: top + height / 2 };
    
    // Calculate distance from center
    const distance = { x: clientX - center.x, y: clientY - center.y };
    
    // Apply strength pull
    x.set(distance.x * strength);
    y.set(distance.y * strength);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={className}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
