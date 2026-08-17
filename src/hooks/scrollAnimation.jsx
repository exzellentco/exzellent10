import { useEffect, useRef, useState } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
const [isVisible, setIsVisible] = useState(false);
const ref = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
        setIsVisible(entry.isIntersecting);
    },
    {
        threshold,
        rootMargin: '-50px 0px',
    }
    );

    if (ref.current) {
    observer.observe(ref.current);
    }

    return () => {
    if (ref.current) {
        observer.unobserve(ref.current);
    }
    };
}, [threshold]);

return [ref, isVisible];
};

export const useStaggeredAnimation = (delay = 100) => {
const [isVisible, setIsVisible] = useState(false);
const ref = useRef(null);

useEffect(() => {
    const observer = new IntersectionObserver(
    ([entry]) => {
        if (entry.isIntersecting) {
        setTimeout(() => setIsVisible(true), delay);
        } else {
        setIsVisible(false);
        }
    },
    { threshold: 0.1, rootMargin: '-30px 0px' }
    );

    if (ref.current) {
    observer.observe(ref.current);
    }

    return () => observer.disconnect();
}, [delay]);

return [ref, isVisible];
};

export const useCursorGlow = () => {
useEffect(() => {
    const cursor = document.createElement('div');
    cursor.className = 'cursor-glow';
    cursor.style.cssText = `
    position: fixed;
    width: 40px;
    height: 40px;
    background: radial-gradient(circle, rgba(59, 130, 246, 0.15) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
    z-index: 9999;
    transform: translate(-50%, -50%);
    transition: opacity 0.3s ease;
    `;
    document.body.appendChild(cursor);

    const handleMouseMove = (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    const target = e.target;
    const isHoverable = target.closest('[data-hover], button, a, .group');
    cursor.style.opacity = isHoverable ? '0' : '1';
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
    document.removeEventListener('mousemove', handleMouseMove);
    document.body.removeChild(cursor);
    };
}, []);
};
