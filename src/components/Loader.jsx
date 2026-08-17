import React from 'react';

const Loader = () => {
  return (
    <div className="flex justify-center items-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1B4A73]"></div>
    </div>
  );
};

export default Loader;
