import React, { useState, useEffect } from "react";
import { ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Questionnaire from "./Questionnaire";
import LogoSvg from "../assets/Exzellent-White.svg";
import { useAnimateOnView } from "../hooks/useAnimateOnView";
/* import HomeActionButtons from "./HomeActionButtons"; */

const HeroSection = () => {
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [buttonsRef, buttonsClass] = useAnimateOnView();
  const navigate = useNavigate();
  const words = ["Exzellent.","Excellent.","Excelente.","відмінно.","出色的.","素晴らしい.","Отличный.","Kiváló.","ممتاز.",];
  const [index, setIndex] = useState(0);
  const [displayed, setDisplayed] = useState("");
  const [phase, setPhase] = useState("typing");
  const [opacity, setOpacity] = useState(0);

  const currentWord = words[index % words.length];
  const isExzellent = currentWord === words[0];

  useEffect(() => {
    if (phase === "typing") {
      if (isExzellent) {
        const t = setTimeout(() => {
          setOpacity(1);
          setTimeout(() => setPhase("waiting"), 2500);
        }, 50);
        return () => clearTimeout(t);
      }
      if (displayed.length < currentWord.length) {
        const t = setTimeout(
          () => setDisplayed(currentWord.slice(0, displayed.length + 1)),
          90,
        );
        return () => clearTimeout(t);
      }
      const t = setTimeout(() => setPhase("waiting"), 1800);
      return () => clearTimeout(t);
    }
    if (phase === "waiting") {
      const t = setTimeout(() => setPhase("deleting"), 200);
      return () => clearTimeout(t);
    }
    if (phase === "deleting") {
      if (isExzellent) {
        setOpacity(0);
        const t = setTimeout(() => {
          setIndex((i) => i + 1);
          setPhase("typing");
        }, 400);
        return () => clearTimeout(t);
      }
      if (displayed.length > 0) {
        const t = setTimeout(() => setDisplayed(displayed.slice(0, -1)), 45);
        return () => clearTimeout(t);
      }
      setIndex((i) => i + 1);
      setDisplayed("");
      setOpacity(0);
      setPhase("typing");
    }
  }, [displayed, phase, currentWord, isExzellent]);

  useEffect(() => {
    if (showQuestionnaire) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [showQuestionnaire]);

  return (
    <>
      <div
        className={`transition-all duration-1000 z-30 flex flex-col items-center justify-center py-15 px-4 mt-15 lg:mt-20 xl:mt-25 mb-12 ${showQuestionnaire ? "-translate-x-full -rotate-90" : "translate-x-0"}`}
        id="hero-section"
      >
        <div
          className="flex flex-col justify-center items-center text-center max-w-4xl pb-10"
          id="hero-content"
        >
          <section className="flex items-center gap-5 text-3xl font-bold mb-5">
                <span className="text-white text-3xl sm:text-5xl">Be </span>
          
                <span className="relative inline-flex items-center text-3xl sm:text-5xl">
                  <span className={`${phase === "deleting" ? "duration-500" : "duration-[2000ms]"} transition-opacity `} style={{ opacity: isExzellent ? opacity : 0 }}>
                    <img src={LogoSvg} className="h-10 sm:h-15 w-auto object-contain" />
                  </span>
          
                  {!isExzellent && (
                    <span className="absolute flex items-center text-transparent bg-clip-text bg-gradient-to-r from-primary/80 to-primary/10">
                      {displayed}
                      <span className="w-1 h-12 bg-tertiary rounded-xs ml-1 text-dynamic-cursor" />
                    </span>
                  )}
                </span>
              </section>
          <h1 className="text-3xl sm:text-5xl xl:text-6xl font-black tracking-tight text-white mb-8 leading-[1.6] ">
            <span className="xl:border-6 border-4 border-primary rounded-xl xl:rounded-xl px-2 py-0 animate-right-left [--animation-delay:0ms]">
              Master
            </span>{" "}
            <span className="appear [--animation-delay:1.5s] text-transparent bg-clip-text bg-gradient-to-r from-primary to-violet-900">
              Languages.
            </span>
            <br />
            <span className="xl:border-6 border-4 border-secondary rounded-xl xl:rounded-xl px-2 py-0 animate-left-right [--animation-delay:500ms]">
              Build
            </span>{" "}
            <span className="appear [--animation-delay:1.5s] text-transparent bg-clip-text bg-gradient-to-r from-secondary to-emerald-700">
              Skills.
            </span>
            <br />
            <span className="xl:border-6 border-4 border-tertiary rounded-xl xl:rounded-xl px-2 py-0 animate-right-left [--animation-delay:1s]">
              Ace
            </span>{" "}
            <span className="appear [--animation-delay:1.5s] text-transparent bg-clip-text bg-gradient-to-r from-tertiary to-amber-300">
              it.
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-white font-bold max-w-2xl mx-auto mb-12 ">
            The premium Edutech platform designed for the future of work.{" "}
            <span className="text-primary">Master</span> global communication
            and high-impact technical{" "}
            <span className="text-secondary">skills,</span> all starting at the
            price of a <span className="text-tertiary">coffee.</span>
          </p>
          <section
            id="buttons-section"
            className={`flex flex-col items-center gap-5 ${buttonsClass}`}
            ref={buttonsRef}
          >
            <button
              onClick={() => {
                setShowQuestionnaire(true);
              }}
              className="bg-gradient-to-r from-blue-800 to-primary text-white font-semibold  group relative px-8 py-3 sm:text-base rounded-xl overflow-hidden cursor-pointer transition-all duration-700 border-4 border-bg hover:border-primary"
            >
              <span className="relative z-10 flex items-center justify-center text-white group-hover:text-primary gap-2 transition-all duration-700 group-hover:translate-x-2 md:text-2xl">
                What's My Learning Fit?{" "}
                <ArrowRight className="w-5 h-5 transition-all duration-700 group-hover:translate-x-2" />
              </span>

              <div className="absolute inset-0 rounded-xl bg-bg scale-x-0 origin-left transition-all duration-500 group-hover:scale-x-100 " />
            </button>

            <button
              onClick={() => navigate("/object-detection")}
              className="bg-gradient-to-r from-blue-800 to-secondary mt-5 text-white font-semibold  group relative px-8 py-3 sm:text-base rounded-xl overflow-hidden cursor-pointer transition-all duration-700 border-4 border-bg hover:border-secondary"
            >
              <span className="relative z-10 flex items-center justify-center text-white group-hover:text-secondary gap-2 transition-all duration-700 group-hover:translate-x-2 md:text-2xl">
                Discover Your World In German{" "}
                <ArrowRight className="w-5 h-5 transition-all duration-700 group-hover:translate-x-2" />
              </span>

              <div className="absolute inset-0 rounded-xl bg-bg scale-x-0 origin-left transition-all duration-500 group-hover:scale-x-100 " />
            </button>
          </section>
        </div>
      </div>

      {/* Home Action Buttons - waiting to know where these buttons are going to be called */}
      <section className="flex flex-col items-center gap-5">
        {/* <HomeActionButtons /> */}
      </section>

      <div
        className={`fixed inset-0 z-50 transition-all duration-1000 ${showQuestionnaire ? "translate-x-0" : "translate-x-[100vw]"}`}
      >
        <div
          className={`flex flex-col items-center justify-center transition-all duration-1000  ${showQuestionnaire ? "border-l-primary bg-black/80" : "border-l-primary border-l-900"} w-full h-full`}
        >
          <p
            onClick={() => {
              setShowQuestionnaire(false);
            }}
            className="h-10 w-10 bg-bg2 rounded-full text-secondary hover:text-secondary/70 border-secondary border-2 items-center flex justify-center cursor-pointer hover:scale-105 transition-all duration-500"
          >
            X
          </p>

          <Questionnaire />
        </div>
      </div>
    </>
  );
};

export default HeroSection;
