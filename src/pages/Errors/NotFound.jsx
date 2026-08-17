import React from "react";
import { useNavigate } from "react-router-dom";

const NotFound = () => {

const navigate = useNavigate();

return (
<div className="flex flex-col place-self-center bg-bg w-full py-28 text-center">
  <h1 className="text-9xl font-bold text-primary">4<span className="text-secondary">0</span>4</h1>
  <div className="w-1/4 h-1 bg-secondary mx-auto my-6" />
  <h2 className="text-4xl font-bold text-white mb-4">Page Not Found!</h2>
  <p className="text-xl text-text-secondary mb-8">We don't really know how you arrived here, but click under to go back to civilization!</p>
  <button onClick={() => {navigate("/")}}className="px-6 py-3 mx-auto bg-primary text-white rounded-lg hover:bg-primary/80 transition-colors cursor-pointer">Back to Home</button>
</div>
);};

export default NotFound;
