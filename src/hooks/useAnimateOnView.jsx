import { useEffect, useRef, useState } from "react";

export const useAnimateOnView = (animationClass = "fade-in-up") => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if element is already in viewport
    const rect = element.getBoundingClientRect();
    const isInViewport = rect.top < window.innerHeight && rect.bottom > 0;

    if (isInViewport) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);

    return () => observer.unobserve(element);
  }, []);

  return [ref, isVisible ? animationClass : "opacity-0"];
};
