import React, { useEffect, useState } from 'react';
import StaticGridBox from './StaticGridBox';

const StaticGridBackground = () => {
const [gridSize, setGridSize] = useState({ cols: 0, rows: 0 });

useEffect(() => {
    const boxSize = 120;
    const calculateGridSize = () => {
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
    <div className="absolute bg-bg inset-0 ">
        <div className="grid w-full h-full" style={{ gridTemplateColumns: `repeat(${gridSize.cols}, 1fr)`}}>
            {Array.from({ length: totalBoxes }, (_, i) => (<StaticGridBox key={i} />))}
        </div>
    </div>
);
};

export default StaticGridBackground;
