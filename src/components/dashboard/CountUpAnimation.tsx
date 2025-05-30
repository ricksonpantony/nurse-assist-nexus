
import { useEffect, useState } from "react";

interface CountUpAnimationProps {
  end: number;
  duration?: number;
  delay?: number;
}

export const CountUpAnimation = ({ end, duration = 2000, delay = 0 }: CountUpAnimationProps) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let startTime: number;
      const animate = (currentTime: number) => {
        if (startTime === undefined) startTime = currentTime;
        const progress = Math.min((currentTime - startTime) / duration, 1);
        
        setCount(Math.floor(progress * end));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    }, delay);

    return () => clearTimeout(timer);
  }, [end, duration, delay]);

  return <span>{count.toLocaleString()}</span>;
};
