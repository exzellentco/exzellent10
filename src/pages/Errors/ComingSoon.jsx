import React from 'react';
import AnimatedBackground from '../../components/AnimatedBackground';

const ComingSoon = () => {
 

    return (
        <>
        <div className="flex mt-0 items-center justify-center min-h-screen px-2 md:px-0 relative">
            <AnimatedBackground className="pointer-events-none" />
            <div className="relative w-full text-center text-white font-bold appear space-y-25">
                <p className='text-3xl lg:text-9xl'>Page is currently <span className='text-primary'>being made!</span></p>
                <p className='text-2xl lg:text-7xl'>Stay tuned for <span className='text-secondary'>future updates!</span></p>
            </div>
            
            
        </div>
        </>
    );
};

export default ComingSoon;