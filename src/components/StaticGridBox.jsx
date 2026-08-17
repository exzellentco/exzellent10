import { useEffect, useState } from "react";

const StaticGridBox = () => {

  const [borderColor, setBorderColor] = useState(getRandomBorder());

  useEffect(() => {
    const interval = setInterval(() => {
      setBorderColor(getRandomBorder());
    }, 3000);

    return () => clearInterval(interval);
  }, []);

function getRandomBorder() {
  let randomNumber = Math.random();

  return randomNumber >= 0.99 ? "border-tertiary bg-tertiary/20 scale-95" :randomNumber >= 0.98 ? "border-primary bg-primary/20 scale-95" : randomNumber > 0.5 ? " border-bg bg-bg" : "bg-secondary/10 border-secondary scale-85";
} 

return (
    <div className={`border-2 ${borderColor} hover:scale-100 hover:duration-300 rounded-xl transition-all duration-700`} />
);
};

export default StaticGridBox;
