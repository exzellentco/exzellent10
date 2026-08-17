import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, Globe, AlertCircle, GraduationCap, ShieldCheck, Check, Languages, ArrowDown } from 'lucide-react';
import SquareBackground from '../components/SquareBackground';
import instance from "../utils/axios";
import Swal from "sweetalert2";

const QuestionAnswers = () => {
  
 const {state} = useLocation();
 const navigate = useNavigate();
 const [email, setEmail] = useState("");
 const [submitting, setSubmitting] = useState(false);
 const answers = state?.answers ?? {}; 
 const score = Object.values(answers).reduce((sum, item) => sum + (item.score || 0), 0);
 const isHighFit = score >= 32;
 const isMidFit = score >= 20 && score < 32;
 const isLowFit = score >= 1 && score < 20;


const handleResultsSubmit = async (e) => {
  e.preventDefault();
  setSubmitting(true);

  try {
    await instance.post("/api/questionnaire/submit", {
      email: email.trim(),
      answers, 
    });

    Swal.fire({
      title: "Success!",
      theme: 'dark',
      text: "Your responses have been saved and sent to your email!",
      icon: "success",
      confirmButtonText: "Great!"
    });
    setEmail("");
  } catch (error) {
    console.error("Submit questionnaire error:", error);
    if (error.response?.status === 400) {
      Swal.fire({
        title: "Oops",
        theme: 'dark',
        text: error.response?.data?.message || "Please check your email and try again.",
        icon: "warning",
        confirmButtonText: "Okay"
      });
    } else {
      Swal.fire({
        title: "Error",
        theme: 'dark',
        text: "Something went wrong. Please try again later.",
        icon: "error",
        confirmButtonText: "Okay"
      });
    }
  } finally {
    setSubmitting(false);
  }
};

 useEffect(() => { if (score < 1) { navigate("/"); }}, [score, navigate]);

 const getProfileData = () => {
   if (isHighFit) {
     return {
       title: "The High-Potential Catalyst",
       analysis: "Your assessment shows an exceptionally clear goal-action alignment. You aren't just looking for content; you're looking for an optimized system to accelerate a path you've already committed to.",
       mainChallenge: "Complexity Management",
       challenges: [
         "Optimizing time-to-fluency ratios",
         "Finding content that matches professional depth",
         "Advanced nuance and cultural intuition"
       ],
       turningPoint: "You've done the hard part, finding the 'Why'. Now you just need the 'How' to be as professional as you are.",
       benefit: "Advanced professional polish in record time."
     };
   } else if (isMidFit) {
     return {
       title: "The Friction-Point Learner",
       analysis: "You have strong motivation, but your current pattern depends too much on external pressure. This creates a cycle of slow growth and the frustrating gap where you understand more than you can express.",
       mainChallenge: "Confidence & Consistency",
       challenges: [
         "Breaking the internal translation habit",
         "Staying consistent beyond initial motivation bursts",
         "Responding naturally under social pressure"
       ],
       turningPoint: "Motivation is the spark, but systemized structure is the engine. You are one shift away from breakthrough.",
       benefit: "A sustainable routine that builds confidence automatically."
     };
   } else if (isLowFit) {
     return {
       title: "The Strategic Explorer",
       analysis: "You are currently in the 'discovery' phase. You're curious but cautious, likely because previous methods felt disconnected or overwhelming. You need a path that proves its value through small, immediate wins.",
       mainChallenge: "Defining the Roadmap",
       challenges: [
         "Identifying high-impact vocabulary first",
         "Overcoming the initial 'daunting' phase of grammar",
         "Building a learning habit from scratch"
       ],
       turningPoint: "The biggest risk is starting without a map. Let's make sure your first steps are in the right direction.",
       benefit: "A clear, low-friction entry point to real communication."
     };
   } else {
    return {
       title: "Havent done it",
       analysis: "You haven't done the Quiz! We are even surprised you arrived here without doing it! What are you doing here? Out!",
       mainChallenge: "Not Done",
       challenges: [
         "Haven't done the quiz"
       ],
       turningPoint: "Really, Consider doing it",
       benefit: "We will give you your results"
    };
   }
 };

const profile = getProfileData();


 return (
<>
  <div className="min-h-screen bg-slate-50 bg-[linear-gradient(to_right,#6185b815_1px,transparent_1px),linear-gradient(to_bottom,#6185b815_1px,transparent_1px)] bg-[size:40px_40px]  flex flex-col md:flex-row pb-20 mt-15">
    
    <main className="py-8 px-4 sm:px-6 max-w-4xl w-full mx-auto space-y-6">

      <div className="bg-white rounded-xl p-8 sm:p-10 ">

        <div className={`p-5 rounded-xl font-black text-2xl md:text-5xl mb-5 text-white
          ${isHighFit ? 'bg-emerald-600' : isMidFit ? 'bg-primary' : isLowFit ? 'bg-secondary' : 'bg-slate-500'}`}>

          <h3 className='text-center'>{profile.title}</h3>

        </div>
            
        <h2 className="text-xl md:text-3xl font-medium text-text-secondary mb-6 text-center">Analysis of your path</h2>

        <p className="text-text-secondary text-lg leading-relaxed mb-8 text-center">{profile.analysis}</p>
            
        <div className="bg-slate-50 rounded-xl p-5 flex flex-col sm:flex-row gap-6 justify-center items-center">
         
          <div className="flex md:flex-row flex-col items-center gap-3 text-foreground">
            {isLowFit ? (<Check className="w-10 h-10 text-secondary" />) : (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-500" />)}

            <div className="text-xs font-medium px-3 py-2 rounded-full bg-secondary text-white whitespace-nowrap">Defining the Roadmap</div>

            <ArrowRight className="hidden sm:block" /><ArrowDown className="block sm:hidden" />
          </div>
     
          <div className="flex md:flex-row flex-col items-center gap-3 text-foreground">
            {isMidFit ? (<Check className="w-10 h-10 text-primary" />) : (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-500" />)}

            <div className="text-xs font-medium px-3 py-2 rounded-full bg-primary text-white whitespace-nowrap">Structural Pivot</div>

            <ArrowRight className="hidden sm:block" /><ArrowDown className="block sm:hidden" />
          </div>

          <div className="flex md:flex-row flex-col items-center gap-3 text-foreground">
            {isHighFit ? (<Check className="w-10 h-10 text-emerald-600 " />) : (
              <div className="w-10 h-10 rounded-full border-2 border-dashed border-slate-500" />)}

            <div className="text-xs font-medium px-3 py-2 rounded-full bg-emerald-600 text-white whitespace-nowrap">Optimization Phase</div>
          </div>

        </div> 

      </div>

      <div className="grid grid-cols-1 gap-6">

        <div className="bg-white rounded-xl p-8  border border-slate-100 overflow-hidden">
          <div className="relative flex flex-col items-center gap-2 mb-6 text-secondary">
            <AlertCircle className="absolute -top-7 opacity-25 transition-transform text-secondary" size={250} />
            <h3 className="font-black uppercase tracking-wider text-3xl">Critical Barriers</h3>
          </div>

          <ul className="space-y-4 gap-5 flex justify-center">
            {profile.challenges.map((item, i) => (
              <li key={i} className="flex flex-col text-text-secondary text-lg font-medium text-center">
                <span className="text-secondary font-black text-center text-3xl md:text-5xl">•</span>{item}
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-xl p-8  border border-slate-100 overflow-hidden">
          <div className="relative flex flex-col items-center gap-2 mb-6 text-primary">
            <ShieldCheck className="absolute -right-20 opacity-25 -rotate-25 transition-transform text-primary" size={250} />
            <h3 className="font-black uppercase tracking-wider text-3xl">Our Focus Area</h3>
          </div>

          <ul className="space-y-4 gap-5 flex justify-center">
            {["Systematic removal of language friction",
              "Direct native-speaker feedback loops",
              "Context-driven conversational practice"].map((item, i) => (
              <li key={i} className="flex flex-col text-text-secondary text-lg font-medium text-center">
                <span className="text-primary font-black text-center text-3xl md:text-5xl">•</span>{item}
                </li>
            ))}
          </ul>
        </div>

      </div>

      <div className="relative bg-white rounded-xl p-10 sm:p-10 text-center  overflow-hidden">

        <Languages className="absolute -bottom-10 -left-10 opacity-25 rotate-25 transition-transform text-emerald-600" size={300} />

        <h3 className="text-2xl font-black text-emerald-600 m-4">{profile.turningPoint}</h3>
        <p className="text-emerald-900 text-xl mb-8 max-w-lg mx-auto">
          When learning is aligned to how you actually process information, progress becomes predictable, not accidental.
        </p>
      </div>

      <div className="bg-white rounded-xl p-6 text-center text-white relative overflow-hidden ">
        
        <Globe className="absolute bottom-5 -right-30 p-10 opacity-25 rotate-25 transition-transform text-primary" size={500} />

        <div className="relative z-10 flex flex-col items-center gap-5">

          <h2 className="text-3xl font-black text-primary">We'll handle the structure.</h2>
          <p className="text-primary/80 text-lg max-w-lg">{profile.benefit} You bring the intention; we design the system that adapts to your reality.</p>

          <input type="email" placeholder="Enter your email address" value={email} onChange={(e) => setEmail(e.target.value)} required disabled={submitting}
            className="sm:w-1/2 p-4 rounded-xl border border-slate-300 border-2 bg-white placeholder-slate-300 text-text-secondary focus:outline-none focus:border-primary"/>
          
          <button onClick={handleResultsSubmit} disabled={submitting}
            className="bg-primary text-white p-4 rounded-xl font-medium text-lg hover:bg-primary/80 transition-all hover:translate-x-1 
            flex items-center justify-center gap-2 group cursor-pointer duration-500">
            Get Results on Email! <ArrowRight size={24} className="group-hover:translate-x-1 transition-all duration-500" />
          </button>

        </div>

      </div>
       
    </main>
  </div>
</>
 );
}

export default QuestionAnswers