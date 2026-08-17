import React, { useEffect, useState } from 'react';
import GridBox from './GridBox';

const AnimatedBackground = () => {
const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });

useEffect(() => {
    const calculateGridSize = () => {
    const boxSize = 200;
    const cols = Math.ceil(window.innerWidth / boxSize);
    const rows = Math.ceil(window.innerHeight / boxSize);
    setGridSize({ cols, rows });
    };

    calculateGridSize();
    window.addEventListener('resize', calculateGridSize);
    return () => window.removeEventListener('resize', calculateGridSize);
}, []);

const totalBoxes = gridSize.cols * gridSize.rows;

return (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none bg-bg2 select-none">
    <div className="grid h-full w-full" style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`, gridTemplateRows: `repeat(${gridSize.rows}, 1fr)` }}>
        {Array.from({ length: totalBoxes }).map((_, index) => (
        <GridBox key={index} index={index} />
        ))}
    </div>
    </div>
);
};

export default AnimatedBackground;