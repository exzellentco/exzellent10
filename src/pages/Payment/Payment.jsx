/* DEPRECATED COMPONENT. WE ARE USING OFFER COMPONENT */

import { useMemo, useState, useEffect } from "react";
import {
  Check,
  Crown,
  Star,
  Zap,
  Shield,
  BadgeEuro,
  Sparkles,
  Info,
  X,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "../../utils/axios";
import { fetchStudentProfile } from "../../APIs/StudentApi/StudentDetails";
import { loadStripe } from "@stripe/stripe-js";
import AnimatedBackground from "../../components/AnimatedBackground";
import { ArrowRight } from "lucide-react";

function buildTiers() {
  return [
    {
      id: "starter",
      title: "Starter",
      bestFor: "Explore the platform",
      tagline: "Dip your toes in — for a small sum.",
      price: "8.99 €/month",
      underPrice: "Only available for people in India",
      accent: "to-primary/50",
      badge: { label: "Affordable", tone: "bg-primary" },
      originalPrice: 0,
      recommended: false,
      features: [
        { label: "4 demo lectures", desc: "Access limited preview content" },
        { label: "No live classes", desc: "Upgrade to join live sessions" },
        { label: "No assessments", desc: "Quizzes & tests not available" },
        { label: "Basic AI tools", desc: "Limited beta access" },
        { label: "No certificate", desc: "Proof of completion not included" },
      ],
      full: {
        purpose: "Let users experience the platform before committing.",
        ideal: ["New visitors", "Curious learners", "Device testers"],
        benefits: ["4 demo lectures", "Platform preview", "Zero cost"],
        included: ["Demo content", "Basic navigation", "AI tool preview"],
        extras: ["Newsletter access"],
        access: "1 month",
        guarantees: ["Small payment", "Upgrade anytime"],
      },
    },
    {
      id: "monthly-subscription",
      title: "Bootcamp Monthly",
      bestFor: "Budget learners",
      tagline: "Full access • Subscription",
      price: "29.99 €/month",
      underPrice: "Get the most out of the site!",
      accent: "to-secondary/50",
      badge: { label: "Popular", tone: "bg-secondary" },
      recommended: false,
      features: [
        {
          label: "4 live classes/month",
          desc: "Join group sessions across languages",
        },
        {
          label: "A1–B2 structured path",
          desc: "Follow clear learning milestones",
        },
        { label: "Full recordings access", desc: "Rewatch anytime" },
        { label: "AI homework feedback", desc: "Instant corrections" },
        { label: "Switch languages", desc: "Learn multiple at once" },
      ],
      full: {
        purpose: "Offers full learning at a monthly price.",
        ideal: [
          "Self-paced learners",
          "Multi-language explorers",
          "Budget-conscious",
        ],
        benefits: [
          "4 live classes/month",
          "A1–B2 modules",
          "Recordings",
          "AI feedback",
          "Full-access to site",
        ],
        included: [
          "Language switching",
          "Certified teachers",
          "Progress tracking",
        ],
        extras: ["Beta tool access", "Weekly challenges"],
        access: "Indefinite until cancellation",
        guarantees: ["14-day refund", "No renewal fees"],
      },
    },
    {
      id: "pro-term-plan",
      title: "Pro Term Plan",
      bestFor: "Fast-track learners",
      tagline:
        "Master a level in weeks • One time payment or 3 month financing",
      price: "49.99 €/3 months",
      underPrice: "3 month program, get the knowledge as quick as possible!",
      accent: "to-tertiary/50",
      badge: { label: "Recommended", tone: "bg-tertiary" },
      recommended: true,
      features: [
        { label: "10–15 classes/month", desc: "High-intensity learning" },
        { label: "Small groups", desc: "More speaking time" },
        { label: "Daily homework review", desc: "Teacher feedback within 24h" },
        { label: "Exam/goal-based plan", desc: "Tailored to your needs" },
        { label: "CV & job analysis", desc: "Career-focused support" },
        { label: "Certificates included", desc: "No extra cost" },
      ],
      full: {
        purpose: "Accelerate fluency with intensive, goal-driven learning.",
        ideal: ["Job seekers", "Students with deadlines", "Relocators"],
        benefits: [
          "10–15 classes/month",
          "Daily feedback",
          "Goal plans",
          "CV help",
          "Certificates",
        ],
        included: ["Mock exams", "Speaking labs", "Priority booking"],
        extras: ["Final roadmap session", "Peer network"],
        access: "3 months",
        guarantees: ["14-day refund"],
      },
    },
  ];
}

export default function PricingTiers() {
  const [showCompare, setShowCompare] = useState(false);
  const [, setNow] = useState(Date.now());
  const [isPaid, setIsPaid] = useState(false);
  const [, setCheckingPaid] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkPaidStatus = async () => {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setIsPaid(false);
        setCheckingPaid(false);
        return;
      }
      setCheckingPaid(true);
      try {
        const user = JSON.parse(userStr);
        const userId = user._id;
        const data = await fetchStudentProfile(userId);
        setIsPaid(data.paid === true);
      } catch {
        setIsPaid(false);
      } finally {
        setCheckingPaid(false);
      }
    };
    checkPaidStatus();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const tiers = useMemo(buildTiers, []);

  const handleSubscribe = async (planId) => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    if (isPaid) return;

    try {
      await loadStripe(
        import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY,
      );
      const response = await axios.post(
        "/api/payments/create-checkout-session",
        { plan: planId },
      );
      const { url } = response.data;
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error("Payment error:", error);
      alert("Failed to initiate payment. Please try again.");
    }
  };

  const featureYes = <Check className="h-4 w-4 text-tertiary" />;
  const featureNo = <X className="h-4 w-4 text-primary" />;
  const featurePartial = <Info className="h-4 w-4 text-secondary" />;

  return (
    <section className="w-full py-20">
      <AnimatedBackground />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 text-center">
        <div className="text-center mb-12 p-6">
          <h2 className="text-4xl md:text-5xl font-bold text-white">
            Meet our <span className="text-primary">plans!</span>
          </h2>
          <p className="mt-4 text-xl text-white mx-auto">
            Whether you're starting out or aiming for fluency, we have a plan
            that fits your goals and budget.
          </p>
          <button
            onClick={() => setShowCompare(true)}
            className="sm:visible collapse mt-6 px-4 py-3 bg-gradient-to-r from-blue-800 to-primary text-white rounded-xl font-medium hover:text-lg transition-all duration-700 cursor-pointer"
          >
            Compare the plans
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8 justify-center mx-4">
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className={`group relative rounded-xl bg-gradient-to-tr from-bg2 ${tier.accent} flex flex-col transition-all duration-700`}
            >
              {tier.badge && (
                <div
                  className={`absolute -top-4 left-6 px-4 py-2 rounded-xl text-xs font-bold text-white ${tier.badge.tone}`}
                >
                  {tier.badge.label}
                </div>
              )}

              <div className="p-8 flex flex-col flex-grow">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <div>
                    <h3 className="text-5xl font-bold text-white">
                      {tier.title}
                    </h3>
                    <p className="text-sm text-white">{tier.bestFor}</p>
                  </div>
                </div>

                <p className="text-white mb-6">{tier.tagline}</p>

                <div className="flex flex-col gap-1 mb-6">
                  <span className="text-4xl font-bold bg-gradient-to-r text-white">
                    {tier.price}
                  </span>

                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-white">{tier.underPrice}</span>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-grow">
                  {tier.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-3 text-white">
                      <div className="mt-1">{featureYes}</div>
                      <span>
                        {f.label}
                        <span className="ml-2 text-xs text-white transition">
                          ({f.desc})
                        </span>
                      </span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={isPaid}
                  className={`group/btn relative px-8 py-3 sm:text-base font-semibold rounded-xl overflow-hidden cursor-pointer border-4  hover:border-transparent hover:scale-105 transition-all duration-700`}
                >
                  <span
                    className={`relative z-10 flex items-center justify-center group-hover:text-white gap-2 transition-all duration-700 group-hover:translate-x-2 md:text-xl`}
                  >
                    {isPaid ? "Already Subscribed" : "Buy Now"}
                    <ArrowRight className="w-5 h-5 transition-all duration-700 group-hover:translate-x-2" />
                  </span>

                  <div
                    className={`absolute inset-0 bg-gradient-to-r scale-x-0 origin-left transition-all duration-700 group-hover/btn:scale-x-100`}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center text-tertiary flex flex-col md:flex-row justify-center items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <Shield size={25} />{" "}
            <span className="text-white">14-day money-back guarantee</span>
          </div>
          <div className="flex items-center gap-2">
            <BadgeEuro size={25} />{" "}
            <span className="text-white">No long-term lock-in</span>
          </div>
          <div className="flex items-center gap-2">
            <Sparkles size={25} />{" "}
            <span className="text-white">All programs included</span>
          </div>
        </div>
      </div>

      {showCompare && (
        <CompareModal
          tiers={tiers}
          onClose={() => setShowCompare(false)}
          featureYes={featureYes}
          featureNo={featureNo}
          featurePartial={featurePartial}
        />
      )}
    </section>
  );
}

function CompareModal({
  tiers,
  onClose,
  featureYes,
  featureNo,
  featurePartial,
}) {
  const keywords = [
    { key: "Access Duration", fn: (t) => t.full.access },
    {
      key: "Live Classes / Month",
      fn: (t) => {
        if (t.id === "free") return "0";
        if (t.id === "early-bird-onetime") return "4";
        if (t.id === "crash-course") return "10–15";
        if (t.id === "pro-early-bird-sub") return "Unlimited";
        if (t.id === "pro-crash-course") return "Intensive + 1-on-1";
        if (t.id === "elite-lifetime") return "All Pro";
      },
    },
    {
      key: "Recordings Access",
      fn: (t) => {
        if (
          t.id === "crash-course" ||
          t.id === "pro-early-bird-sub" ||
          t.id === "elite-lifetime"
        )
          return featureYes;
        return hasFeature(t, ["recordings"]) ? featureYes : featureNo;
      },
    },
    {
      key: "AI Homework Feedback",
      fn: (t) => {
        if (
          t.id === "crash-course" ||
          t.id === "pro-early-bird-sub" ||
          t.id === "elite-lifetime"
        )
          return featureYes;
        return hasFeature(t, ["AI feedback", "AI homework"])
          ? featureYes
          : featureNo;
      },
    },
    {
      key: "Teacher Review SLA",
      fn: (t) => {
        if (t.id === "crash-course") return "24h";
        if (t.id === "pro-crash-course") return "12h";
        if (t.id === "pro-early-bird-sub") return "Weekly (flagged)";
        return t.id === "free" ? featureNo : "Included";
      },
    },
    {
      key: "1-on-1 Coaching",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return hasFeature(t, ["1-on-1", "coaching"]) ? featureYes : featureNo;
      },
    },
    {
      key: "CV & Job Support",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return hasFeature(t, ["CV", "job", "interview"])
          ? featureYes
          : featureNo;
      },
    },
    {
      key: "Exam Prep Tracks",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return hasFeature(t, ["exam prep", "Goethe", "TELC", "TestDaF"])
          ? featureYes
          : featureNo;
      },
    },
    {
      key: "Certificates",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return t.id === "free"
          ? featureNo
          : t.id === "early-bird-onetime"
            ? featurePartial
            : featureYes;
      },
    },
    {
      key: "Mobile App Access",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return hasFeature(t, ["app", "iOS", "Android"])
          ? featureYes
          : featureNo;
      },
    },
    {
      key: "Pro Community",
      fn: (t) => {
        if (t.id === "pro-early-bird-sub" || t.id === "elite-lifetime")
          return featureYes;
        return hasFeature(t, ["community", "matchmaking", "network"])
          ? featureYes
          : featureNo;
      },
    },
  ];

  const orderedTiers = useMemo(() => {
    const proEarlyBird = tiers.find((t) => t.id === "pro-early-bird-sub");
    const otherTiers = tiers.filter((t) => t.id !== "pro-early-bird-sub");
    const earlyBirdIndex = otherTiers.findIndex(
      (t) => t.id === "early-bird-onetime",
    );
    if (proEarlyBird && earlyBirdIndex !== -1) {
      otherTiers.splice(earlyBirdIndex + 1, 0, proEarlyBird);
      return otherTiers;
    }
    return tiers;
  }, [tiers]);

  const hasFeature = (t, terms) => {
    const text = (t.features || [])
      .map((f) => `${f.label} ${f.desc}`)
      .join(" ")
      .toLowerCase();
    return terms.some((term) => text.includes(term.toLowerCase()));
  };

  const renderCell = (t, row) => {
    if (row.fn) return row.fn(t);
    return hasFeature(t, row.match) ? featureYes : featureNo;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 overflow-y-auto ">
      <div className="bg-bg rounded-xl overflow-y-auto m-4 sm:p-4 max-h-[90vh]">
        <div className="flex justify-end items-center">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-slate-500/20 font-bold cursor-pointer transition-all duration-700"
          >
            X
          </button>
        </div>

        <p className="text-2xl font-bold text-primary text-center border-b py-2 border-slate-200">
          Compare Plans
        </p>

        <table className="w-full mt-4 overflow-x-auto">
          <thead>
            <tr className="text-left border-b border-slate-200">
              <th className="pb-4 font-semibold text-white text-sm">Feature</th>
              {orderedTiers.map((t) => (
                <th key={t.id} className="pb-4 px-4 font-semibold text-sm">
                  <div className="text-white font-bold">{t.title}</div>
                  <div className="text-2xl font-bold text-white mt-1">
                    {t.price}
                  </div>
                  <div className="text-xs text-white">{t.priceNote}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {keywords.map((row) => (
              <tr key={row.key} className="border-b border-slate-100">
                <td className="py-4 pr-6 font-medium text-white text-sm">
                  {row.key}
                </td>
                {orderedTiers.map((t) => (
                  <td key={t.id} className="py-4 px-4 text-center">
                    {typeof renderCell(t, row) === "string" ? (
                      <span className="text-white text-sm">
                        {renderCell(t, row)}
                      </span>
                    ) : (
                      <div className="flex justify-center">
                        {renderCell(t, row)}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
