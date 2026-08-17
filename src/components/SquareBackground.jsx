const SquareBackground = () => {


 return (
 <>
    <div className="absolute inset-0 opacity-30">

        <div className="w-full h-full" style={{
            backgroundImage: `linear-gradient(to right, #1E1E2E 1px, transparent 1px),linear-gradient(to bottom, #1E1E2E 1px, transparent 1px)`,
            backgroundSize: '40px 40px', animation: 'grid-float 15s ease-in-out infinite',}}>
        </div>
        
    </div>
    
    <style>
        {`
        @keyframes grid-float {
            0%, 100% { transform: translate(0, 0) scale(1); }
            25% { transform: translate(10px, -10px) scale(1.02); }
            50% { transform: translate(-5px, 5px) scale(0.98); }
            75% { transform: translate(15px, 10px) scale(1.01); }
        }
        `}
    </style>
 </>

 );
}

export default SquareBackground