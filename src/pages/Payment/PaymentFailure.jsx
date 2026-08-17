import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CreditCard, X } from "lucide-react";
import { Button } from "../../UI/Button";

const PaymentFailure = () => {
    const [showProcessing, setShowProcessing] = useState(true);
    const [showButton, setShowButton] = useState(false);
    const [status, setStatus] = useState("loading"); // loading, failure, error
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const sessionId = searchParams.get("session_id");

    useEffect(() => {
        setStatus("failure");
    }, [sessionId]);

    useEffect(() => {
        if (status !== "failure") return;
        const timer1 = setTimeout(() => {
            setShowProcessing(false);
        }, 2000);
        const timer2 = setTimeout(() => {
            setShowButton(true);
        }, 3500);
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
        };
    }, [status]);

    if (status === "loading") {
        return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
    }
    if (status === "error") {
        return <div className="flex items-center justify-center min-h-screen text-red-600 font-bold text-xl">Invalid or incomplete payment session.</div>;
    }

    return (
        <div className="relative min-h-screen bg-background flex flex-col items-center justify-center p-4 overflow-hidden">
        {showProcessing ? null : (
            <>
            <div className="flex flex-col items-center z-10">
                <div className="relative mb-8">
                <div className="circle border-4 border-tertiary text-tertiary">
                    <X size={50}/>
                </div>
                </div>
                <div className="text-center mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Payment Failed</h1>
                <p className="text-lg text-white">There was an issue processing your payment. Please try again.</p>
                </div>
                {showButton && (
                <button onClick={() => navigate("/offer")}
                    className="animate-fade-in bg-gradient-to-l from-tertiary to-red-600 text-white py-3 px-4 text-lg rounded-md cursor-pointer transition-all duration-700 hover:scale-105">
                    Try Again
                </button>
                )}
            </div>
            </>
        )}
        </div>
    );
};

export default PaymentFailure;
