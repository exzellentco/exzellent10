import React, { useState } from 'react';
import { Plus, Minus } from 'lucide-react';
import { useScrollAnimation } from '../hooks/scrollAnimation';
import SquareBackground from './SquareBackground';


const FAQ = () => {
const [sectionRef] = useScrollAnimation();
const [visibleCount, setVisibleCount] = useState(4);

let faqs = [
  {
    "question": "What is Exzellent?",
    "answer": "Exzellent is an AI-powered education platform built to deliver scalable learning through live teaching, digital resources, and personalized learner support."
  },
  {
    "question": "What solutions does Exzellent provide?",
    "answer": "We offer language learning, exam preparation, skill-based education, AI-supported learning workflows, and structured teacher-led engagement."
  },
  {
    "question": "Who is Exzellent designed for?",
    "answer": "Exzellent is designed for learners, teachers, institutions, training providers, and organizations seeking modern, flexible, and scalable education solutions."
  },
  {
    "question": "What makes Exzellent valuable for partners?",
    "answer": "Exzellent combines human-led instruction with AI-powered support, learner tracking, and digital study infrastructure to improve engagement and outcomes."
  },
  {
    "question": "Do you work with teachers and institutions?",
    "answer": "Yes. We collaborate with teachers, universities, training providers, and organizations looking to expand educational access and learner success."
  },
  {
    "question": "What support do learners receive on the platform?",
    "answer": "Learners receive access to live classes, study materials, practice resources, assessments, and progress-tracking tools."
  },
  {
    "question": "Can Exzellent support strategic collaborations?",
    "answer": "Yes. We are open to academic, training, community, and business partnerships aligned with innovation in education and workforce development."
  },
  {
    "question": "Does Exzellent offer live classes?",
    "answer": "Yes. Exzellent supports live sessions led by experienced teachers, trainers, and subject experts depending on the course or collaboration model."
  },
  {
    "question": "Does the platform include AI-powered learning support?",
    "answer": "Yes. Our platform integrates AI-powered features to support personalized learning, guidance, practice, and learner engagement."
  },
  {
    "question": "Can partners deliver their own programs through Exzellent?",
    "answer": "Yes. Partners can explore opportunities to deliver courses, workshops, or specialized learning experiences through the Exzellent ecosystem."
  },
  {
    "question": "What types of courses can be hosted on Exzellent?",
    "answer": "The platform can support language programs, exam preparation, professional skills training, workshops, and selected AI and automation learning modules."
  },
  {
    "question": "Does Exzellent provide learner progress tracking?",
    "answer": "Yes. Exzellent includes dashboard-based tracking features that help monitor learner engagement, activity, and progress."
  },
  {
    "question": "Can Exzellent support workforce development initiatives?",
    "answer": "Yes. Our platform can support practical education and skill-building initiatives aligned with employability, upskilling, and workforce readiness."
  },
  {
    "question": "Do you provide study materials and assessments?",
    "answer": "Yes. We provide learning materials, exercises, assessments, quizzes, and other resources to support effective course delivery."
  },
  {
    "question": "Can universities collaborate with Exzellent?",
    "answer": "Yes. Universities can collaborate with us for language education, learner support, workshops, digital learning initiatives, and co-branded programs."
  },
  {
    "question": "Can trainers and subject experts join the platform?",
    "answer": "Yes. Trainers, teachers, and subject experts are welcome to explore partnership opportunities and contribute to high-quality learning experiences."
  },
  {
    "question": "Does Exzellent support exam preparation programs?",
    "answer": "Yes. We support exam preparation through structured guidance, practice resources, and teacher-led learning support."
  },
  {
    "question": "How does Exzellent improve learning outcomes?",
    "answer": "By combining expert teaching, AI-powered support, digital resources, and progress tracking, Exzellent helps create more engaging and effective learning journeys."
  },
  {
    "question": "Can organizations use Exzellent for community learning programs?",
    "answer": "Yes. Community groups, training organizations, and educational initiatives can work with Exzellent to deliver accessible and scalable programs."
  },
  {
    "question": "How can a partner get started with Exzellent?",
    "answer": "Partners can begin by connecting with our team to explore collaboration opportunities, program delivery models, and shared growth goals."
  }
];

const visibleFaqs = faqs.slice(0, visibleCount);
const hasMore = visibleCount < faqs.length;

const handleShowMore = () => {
  setVisibleCount(prev => Math.min(prev + 4, faqs.length));
};

const handleShowLess = () => {
  setVisibleCount(prev => Math.min(prev - 4, faqs.length));
};

return (
    <section ref={sectionRef} className="py-8 bg-bg relative overflow-hidden" >
        
        <SquareBackground />

    <div className="max-w-4xl mx-auto px-8 relative z-10">

        <div className="w-full text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-extrabold mt-6 text-white">Frequently Asked <span className="text-primary ">Questions</span></h2>
        </div>

        <div className="mt-4 space-y-3">
            {visibleFaqs.map((faq, index) => (
              <AccordionItem key={index} question={faq.question} answer={faq.answer}/>
            ))}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          {hasMore && (
            <button onClick={handleShowMore}
              className="bg-gradient-to-r from-blue-800 to-primary text-white font-semibold  group relative px-8 py-3 sm:text-base rounded-xl overflow-hidden cursor-pointer transition-all duration-700 hover:scale-95">
              Show More
            </button>
          )}
          {visibleCount > 4 && (
            <button onClick={handleShowLess}
              className="px-6 py-3 rounded-xl border border-white text-white font-semibold hover:border-secondary hover:text-secondary transition-all duration-700 hover:scale-95">
              Show Less
            </button>
          )}
        </div>

    </div>
    </section>
);
};

const AccordionItem = ({ question, answer }) => {
const [isOpen, setIsOpen] = useState(false);

return (
    <div onClick={() => setIsOpen(!isOpen)} className={`group cursor-pointer transition-all duration-500 `} >
    <div className="mb-4 rounded-xl bg-bg2 border border-border/20 transition-all duration-300">
        <p className="w-full flex items-center justify-between p-5 text-lg font-semibold text-white group-hover:text-secondary transition-all duration-300" >
            <span>{question}</span>{isOpen ? (<Minus className="w-5 h-5 text-tertiary" />) : (<Plus className="w-5 h-5 text-secondary" />)}
        </p>
        <div className={`transition-all duration-500 px-6 text-white ${isOpen ? 'max-h-[500px] pb-6 opacity-100' : 'max-h-0 pb-0 opacity-0'}`}>{answer}</div>
    </div>
    </div>
);
};


export default FAQ;
