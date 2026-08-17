import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, User, Bot } from 'lucide-react';

const Questionnaire = () => {
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const SURVEY_DATA = [
    {
      id: 'q1_language',
      botMessage: "Hi there! I'm your learning path architect. To start, which language are you currently trying to learn?",
      options: [
        { id: "german", text: "German", flag: "🇩🇪", score: 5 },
        { id: "spanish", text: "Spanish", flag: "🇪🇸", score: 5 },
        { id: "ukranian", text: "Ukranian", flag: "🇺🇦", score: 5 },
        { id: "polski", text: "Polski", flag: "🇵🇱", score: 5 },
        { id: "english", text: "English", flag: "🇬🇧", score: 5 },
        { id: "undecided", text: "I’m not sure yet", score: 3 }
      ],
      store_as: "language",
      next: "q2_goal"
    },
    {
      id: 'q2_goal',
      botMessage: "What’s your primary reason for learning this language?",
      reflection: "That helps clarify what success would actually mean for you.",
      options: [
        { id: "career", text: "Career or work-related", score: 5 },
        { id: "living", text: "Living in a country where it’s spoken", score: 5 },
        { id: "travel", text: "Travel or relocation plans", score: 4 },
        { id: "personal", text: "Personal interest or self-growth", score: 3 },
        { id: "exploring", text: "I’m exploring — no clear reason yet", score: 1 }
      ],
      store_as: "primary_goal",
      next: "q3_usage_frequency"
    },
    {
      id: 'q3_usage_frequency',
      botMessage: "How often do you currently use this language in real life?",
      reflection: "Exposure level matters more than most people realize.",
      options: [
        { id: "daily", text: "Daily", score: 5 },
        { id: "weekly", text: "A few times a week", score: 4 },
        { id: "monthly", text: "A few times a month", score: 3 },
        { id: "rarely", text: "Rarely, but I know I should", score: 2 },
        { id: "never", text: "Not at all yet", score: 1 }
      ],
      store_as: "usage_frequency",
      next: "q4_pressure_moment"
    },
    {
      id: 'q4_pressure_moment',
      botMessage: "Think about the last time you needed to speak this language under pressure. What did you try first?",
      reflection: "That response pattern shows how you handle uncertainty.",
      options: [
        { id: "spoke_anyway", text: "I spoke anyway, even if it wasn’t perfect", score: 5 },
        { id: "switched_language", text: "I switched to English quickly", score: 2 },
        { id: "avoided", text: "I avoided speaking altogether", score: 1 },
        { id: "prepared_phrases", text: "I prepared sentences in advance", score: 4 },
        { id: "not_happened", text: "This situation hasn’t happened yet", score: 3 }
      ],
      store_as: "pressure_response",
      next: "q5_cost_of_moment"
    },
    {
      id: 'q5_cost_of_moment',
      botMessage: "That situation cost me:",
      reflection: "Moments like this usually shape learning motivation.",
      options: [
        { id: "no_cost", text: "Nothing — I handled it fine", score: 5 },
        { id: "confidence", text: "Some confidence", score: 3 },
        { id: "clarity", text: "Clarity or respect", score: 2 },
        { id: "opportunity", text: "A real opportunity (meeting, task, connection)", score: 1 },
        { id: "na", text: "Not applicable / I don’t remember", score: 3 }
      ],
      store_as: "pressure_cost",
      next: "q6_learning_style"
    },
    {
      id: 'q6_learning_style',
      botMessage: "I learn a foreign language best when:",
      reflection: "That gives a strong signal on how structure should look for you.",
      options: [
        { id: "forced_speaking", text: "I’m forced to speak with native speakers", score: 5 },
        { id: "native_prep", text: "I prepare in my native language first", score: 3 },
        { id: "visual_audio", text: "Words are mapped to images with audio", score: 4 },
        { id: "writing_first", text: "I write to understand before speaking", score: 3 },
        { id: "all_methods", text: "I need all of the above", score: 5 },
        { id: "unsure", text: "I don’t know — guide me", score: 2 }
      ],
      store_as: "learning_style",
      next: "q7_interest_mapping"
    },
    {
      id: 'q7_interest_mapping',
      botMessage: "I engage more when language learning is connected to:",
      reflection: "Motivation usually accelerates when content feels relevant.",
      options: [
        { id: "career", text: "My career or studies", score: 5 },
        { id: "culture", text: "Travel, culture, or people", score: 4 },
        { id: "personal_interests", text: "My personal interests", score: 4 },
        { id: "problem_solving", text: "Real-life problem-solving", score: 5 },
        { id: "unknown", text: "I haven’t experienced this kind of learning yet", score: 2 }
      ],
      store_as: "interest_mapping",
      next: "q8_readiness"
    },
    {
      id: 'q8_readiness',
      botMessage: "If this course clearly helped you reach your goal, when would you like to start?",
      reflection: "That helps set expectations realistically.",
      options: [
        { id: "immediately", text: "Immediately", score: 5 },
        { id: "30_days", text: "Within the next 30 days", score: 4 },
        { id: "1_3_months", text: "In 1–3 months", score: 2 },
        { id: "later", text: "Later — not sooner", score: 1 },
        { id: "exploring", text: "I was just exploring", score: 1 }
      ],
      store_as: "start_intent",
      next: "results"
    }
  ];

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [history, isTyping]);

  useEffect(() => {
    setIsTyping(true);
    const timer = setTimeout(() => {
      setHistory([{ type: 'bot', text: SURVEY_DATA[0].botMessage }]);
      setIsTyping(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleSelection = async (option) => {
    const currentQ = SURVEY_DATA[currentIndex];
    const displayText = option.flag ? `${option.text} ${option.flag}` : option.text;
    setHistory(prev => [...prev, { type: 'user', text: displayText }]);
    setAnswers(prev => ({
      ...prev,
      [currentQ.store_as]: {
        text: displayText,
        score: option.score
      }
    }));

    if (currentQ.reflection) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 600));
      setHistory(prev => [...prev, { type: 'bot', text: currentQ.reflection }]);
      setIsTyping(false);
    }

    const nextIdx = currentIndex + 1;
    if (nextIdx < SURVEY_DATA.length) {
      setIsTyping(true);
      await new Promise(r => setTimeout(r, 800));
      setCurrentIndex(nextIdx);
      setHistory(prev => [...prev, { type: 'bot', text: SURVEY_DATA[nextIdx].botMessage }]);
      setIsTyping(false);
    } else {

      setIsTyping(true);
      await new Promise(r => setTimeout(r, 1200));

      const updatedAnswers = {
        ...answers,
        [currentQ.store_as]: {
          text: displayText,
          score: option.score
        }
      };

      setAnswers(updatedAnswers);
      navigate('/QuestionAnswers', { state: { answers: updatedAnswers } });
    }
  };

  const currentQuestion = SURVEY_DATA[currentIndex];

  return (
<>
  <main className="overflow-hidden rounded-xl flex flex-col m-5 sm:aspect-square">

    <div className="overflow-y-auto p-4 space-y-6 pt-10 bg-bg2 grow">

      {history.map((msg, i) => (
        <div key={i} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>

          <div className={`flex gap-3 w-3/4 ${msg.type === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>

            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${msg.type === 'user' ? 'bg-secondary' : 'bg-white border-primary border'}`}>
              {msg.type === 'user' ? <User className="text-white" /> : <Bot className="text-primary" />}
            </div>

            <div className={`p-4 rounded-2xl text-sm font-medium ${
              msg.type === 'user' ? 'bg-secondary text-white rounded-tr-none' : 'bg-white text-primary border-2 border-primary rounded-tl-none' }`}>
              {msg.text}
            </div>

          </div>
        </div>
      ))}
    
      {isTyping && (
        <div className="flex justify-start animate-in fade-in duration-300 gap-3 w-3/4">
          
          <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 bg-white border border-primary">
            <Bot className="text-primary" />
          </div>

          <div className="bg-white p-4 rounded-2xl rounded-tl-none border-2 border-primary flex gap-1.5 items-center">
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
            <div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
          </div>
        </div>
      )}

      <div ref={chatEndRef} />

    </div>

    <div className="p-6 bg-bg">

      {!isTyping && history[history.length - 1]?.type === 'bot' && (
        <div className="animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-2 md:grid-cols-1 justify-center gap-2 overflow-y-auto">
            {currentQuestion.options.map((opt, idx) => (
              <button key={idx} onClick={() => handleSelection(opt)}
                className="bg-bg2 border border-primary/20 p-2 md:px-5 md:py-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-between group cursor-pointer hover:scale-98 duration-300 hover:text-secondary">
                <span>{opt.flag && <span className="mr-3">{opt.flag}</span>}{opt.text}</span>
                <ChevronLeft className="text-white group-hover:text-secondary rotate-180 group-hover:rotate-90 transition-all duration-300" />
              </button>
            ))}
          </div>
        </div>
      )}

    </div>

  </main>
</>
);};

export default Questionnaire;
