import React, { useState, useEffect, useRef } from 'react';

const GridBox = ({ index }) => {
  const [displayText, setDisplayText] = useState('');
  const [, setCurrentWord] = useState('');
  const [colorScheme, setColorScheme] = useState('slate'); // initial color
  const [isTyping, setIsTyping] = useState(false);

  const boxRef = useRef(null);

  const words = [
    'Hello', 'Hola', 'Bonjour', 'Hallo', 'Olá', 'こんにちは',
    'Welcome', 'Bienvenido', 'Bienvenue', 'Willkommen', 'Bem-vindo', 'ようこそ',
    'Learn', 'Aprender', 'Apprendre', 'Lernen',
    'Excellence', 'Excelência', 'Exzellenz',
    'Future', 'Futuro', 'Avenir', 'Zukunft', '未来'
  ];

  // Typing loop with type-in / type-out and per-word color
  useEffect(() => {
    let typingTimeout;

    const typeWordCycle = () => {
      setIsTyping(true);

      // pick word & color for this cycle
      const word = words[Math.floor(Math.random() * words.length)];
      let randomness = Math.random()
      const color = randomness > 0.6 ? 'primary' : randomness > 0.3 ? 'secondary' : 'tertiary';
      setCurrentWord(word);
      setColorScheme(color);

      let charIndex = 0;
      let direction = 1; // 1 = typing in, -1 = deleting

      const speedIn = 150 + Math.random() * 50; // slower typing
      const speedOut = speedIn + 100;            // slower deleting

      const tick = () => {
        setDisplayText(word.slice(0, charIndex));
        charIndex += direction;

        if (direction === 1 && charIndex > word.length) {
          direction = -1;
          charIndex = word.length;
        }

        if (direction === -1 && charIndex < 0) {
          setDisplayText('');
          setIsTyping(false);
          // schedule next cycle with random delay
          typingTimeout = setTimeout(typeWordCycle, 3000 + Math.random() * 12000);
          return;
        }

        typingTimeout = setTimeout(tick, direction === 1 ? speedIn : speedOut);
      };

      tick();
    };

    // Random initial delay so boxes start staggereds
    const initialDelay = Math.random() * 15000 ;
    typingTimeout = setTimeout(typeWordCycle, initialDelay);

    return () => clearTimeout(typingTimeout);
  }, [index]);

  const textClass = colorScheme === 'primary' ? 'text-primary/30' : colorScheme === 'secondary' ? 'text-secondary/30' : colorScheme === 'tertiary' ? 'text-tertiary/30':'text-white';

return (
  <div ref={boxRef} className={`relative transition-all duration-700 flex items-center justify-center p-2 bg-bg pointer-events-none`}>

    <p className={`text-xs sm:text-xl font-bold transition-all duration-300 text-center ${textClass}`}
      style={{ opacity: displayText ? 1 : 0.4, transform: displayText ? 'scale(1)' : 'scale(0.85)'}}>
      {displayText}
    </p>

    {isTyping && (
      <span className={`ml-1 animate-pulse ${textClass}`}>|</span>
    )}
  </div>
);};

export default GridBox;
