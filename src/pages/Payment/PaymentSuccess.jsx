import { useNavigate } from "react-router-dom";
import { Button } from "../../UI/Button";

const PaymentSuccess = () => {
    const navigate = useNavigate();
    return (
        <div className="relative min-h-screen flex flex-col items-center justify-center p-4 overflow-hidden">
            
            <div className="relative z-10 w-full flex flex-col items-center">
   
                <div className="flex flex-col items-center">
                <div className="relative mb-8">
                    <div className="circle border-4 border-primary">
                        <div className="success-tick mb-4">
                            <div className="tick-stem bg-primary" style={{ height: "44px",left: "14px", top: "7px", width: "5px",}}/>
                            <div className="tick-kick bg-primary" style={{ height: "18px", left: "10px", top: "28px", width: "5px",}}/>                    
                        </div>
                    </div>
                </div>

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-2 text-white">Payment Successful!</h1>
                    <p className="text-lg text-white">Your payment has been completed successfully.</p>
                </div>

                <Button onClick={() => navigate("/courses")}
                    className="animate-fade-in bg-gradient-to-r from-blue-800 to-primary cursor-pointer transition-all duration-700 p-4 rounded-md text-white font-medium text-lg hover:scale-105">
                    Go to Courses
                </Button>
                </div>
            </div>
        </div>
    );
};

export default PaymentSuccess;