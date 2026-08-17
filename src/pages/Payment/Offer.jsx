import { useMemo, useState } from "react";
import { Check, Crown, Star, Zap, Shield, BadgeEuro, Sparkles, Info, X, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { loadStripe } from "@stripe/stripe-js";
import AnimatedBackground from "../../components/AnimatedBackground";
import ToggleDetailsButton from "../../UI/ToggleDetailsButton";

function buildTiers() {
  return [
    {
      id: "starter",
      title: "Starter",
      bestFor: "Best for light learners and first-time users",
      price: "8.99 €",
      underPrice: "/Month",
      regularPrice: "€12.99",
      credits:"200",
      accent: "to-primary",
      border:"border-primary",
      badge: { label: "Affordable", tone: "bg-primary" },
      features: [
        { label: "Discussion classes with teachers." },
        { label: "Guided discussion sessions per month." },
        { label: "Unlimited access to webinars." },
        { label: "Flexible access across the platform." },
        { label: "AI features included." },
        { label: "Certificate of completion included." },
      ],
    },
    {
      id: "Premium",
      title: "Premium",
      bestFor: "Best for active learners who want more support",
      price: "29.99 €",
      underPrice: "/Month",
      regularPrice: "€49.99",
      credits:"1000",
      accent: "to-secondary",
      border:"border-secondary",
      badge: { label: "Popular", tone: "bg-secondary" },
      features: [
        { label: "Includes everything in Starter." },
        { label: "1000 credits + Bootcamp access." },
        { label: "Join live classes and bootcamp sessions." },
        { label: "Structured language + Skill lab learning." },
        { label: "Full recording access." },
        { label: "AI homework, video and audio feedback." },
        { label: "Exam preparation + AI exam preparation." },
        { label: "Exclusive ERS feedback system." },
        { label: "Switch between tracks or languages." },
        { label: "Certificate available on completed courses." },
      ],
    },
    {
      id: "pro-term-plan",
      title: "Pro Term Plan",
      bestFor: "Best for serious long-term learners",
      price: "49.99 €",
      credits:"3500",
      underPrice: "/ 3 Months",
      regularPrice: "€89.99",
      accent: "to-tertiary",
      border:"border-tertiary",
      badge: { label: "Recommended", tone: "bg-tertiary" },
      features: [
        { label: "Includes everything in Premium." },
        { label: "3500 credits included." },
        { label: "Higher-value plan for long-term learning." },
        { label: "Premium features across the platform." },
        { label: "Exam and goal-based learning support." },
        { label: "Small group and guided learning support." },
        { label: "CV and career support." },
        { label: "All premium AI features included." },
        { label: "All upcoming features included." },
        { label: "Certificates and references included." },
      ],
    },
  ];
}

export default function PricingTiers() {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const toggleDetails = (id) => {
    setExpandedId((prevExpandedId) => (prevExpandedId === id ? null : id));
  };

  const handleSubscribe = async (planId) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { 
      navigate("/login");
        return;
    }

    try {
      await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      );
      const response = await axios.post(
        "/api/payments/create-checkout-session",
        {
          plan: planId,
        },
      );

      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Payment error:", error.response?.data || error);
      alert(
        error.response?.data?.error ||
          "Failed to initiate payment. Please try again or contact support.",
      );
    }
  };
  const tiers = useMemo(buildTiers, []);

  return (
    <section className="w-full pt-20 pb-10 relative">
      <AnimatedBackground />
      <div className="relative mx-auto text-center">
        <div className="text-center mb-12 py-10  bg-bg2">
          <h2 className="text-4xl md:text-6xl font-bold text-white">Meet <span className="text-primary">our plans!</span></h2>
          <p className="mt-4 text-xl text-white mx-auto">Whether you're starting out or aiming for fluency, we have a plan that fits your goals and budget.</p>
        </div>

        <div className="flex justify-center items-center flex-wrap gap-8 mx-4">
          {tiers.map((tier) => {
            const isExpanded = expandedId === tier.id;
            return (
              <div key={tier.id}
                className={`group relative rounded-xl bg-gradient-to-tr from-bg2 ${tier.accent} flex flex-col justify-center items-center transition-all duration-300 hover:-translate-y-1 hover:`}>
                {tier.badge && (
                  <div className={`absolute -top-4 left-6 px-5 py-2 rounded-lg text-sm font-bold text-white ${tier.badge.tone}`}>{tier.badge.label}</div>
                )}

                <div className="p-8 flex flex-col flex-grow text-center">
                  <h3 className="text-4xl font-bold text-white mb-3">{tier.title}</h3>
                  <p className="text-lg text-white mb-3">{tier.bestFor}</p>

                  <p className="text-2xl font-bold text-white mb-6">{tier.credits} credits</p>

                  <div className="mb-2 flex items-baseline gap-2 justify-center">
                    <span className="text-5xl font-extrabold text-white">{tier.price}</span>
                    <p className="text-sm text-white mt-1">{tier.underPrice}</p>
                  </div>
                  <div className="mb-8 flex gap-2 items-baseline">
                    <p className="text-xs text-white/70">Regular price:</p>
                    <span className="text-sm text-white line-through">{tier.regularPrice}</span>
                  </div>

                  {/* First 4 features always visible */}
                  <ul className="space-y-4 mb-10">
                    {tier.features.slice(0, 4).map((f, i) => (
                      <li key={i} className="flex gap-2 text-white">
                        <Check className=" text-tertiary" />{f.label}
                      </li>
                    ))}
                  </ul>

                  {/* Extra features only if expanded */}
                  {isExpanded && (
                    <div>
                      <p className="text-white font-bold text-3xl mb-6">+</p>
                      <ul className="space-y-4 mb-6">
                        {tier.features.slice(4).map((f) => (
                          <li key={tier.id} className="flex gap-2 text-white">
                            <Check className=" text-tertiary" />{f.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <section className="mt-auto flex gap-2">
                    <button onClick={() => handleSubscribe(tier.id)}
                      className={`group/btn relative p-5 font-semibold rounded-xl overflow-hidden cursor-pointer border-4 ${tier.border} transition-all duration-700 hover:scale-105`}>
                      <span className="relative z-10 flex items-center justify-center text-white gap-2 md:text-xl">
                        Buy Now! <ArrowRight className="w-6 h-6 transition-all duration-500 group-hover/btn:translate-x-2" />
                      </span>
                      <div className={`absolute inset-0 bg-gradient-to-r from-bg2 ${tier.accent} scale-x-0 origin-left transition-all duration-500 group-hover/btn:scale-x-100`} />
                    </button>

                    <ToggleDetailsButton isOpen={isExpanded} onToggle={() => toggleDetails(tier.id)} />
                  </section>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center text-tertiary flex flex-col md:flex-row justify-center items-center gap-8 text-lg">
          <div className="flex items-center gap-3">
            <Shield size={30} /><span className="text-white">14-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-3">
            <BadgeEuro size={30} /><span className="text-white">No long-term lock-in</span>
          </div>
          <div className="flex items-center gap-3">
            <Sparkles size={30} /><span className="text-white">All programs included</span>
          </div>
        </div>
      </div>
    </section>
  );
}
