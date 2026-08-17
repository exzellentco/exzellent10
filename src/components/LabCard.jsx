import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const LabCard = ({type, title, description, items, href}) => {

  const navigate = useNavigate()

const isLanguage = type === 'language';
  const isCareer = type === 'career';
  const labUrl = href || (isLanguage ? '/courses' : '/coming-soon');

  // The lab pages are standalone HTML in /public, so they are outside React
  // Router and need a real page load. Internal routes still use navigate().
  const openLab = () => {
    if (/^https?:\/\//.test(labUrl) || labUrl.endsWith('.html')) {
      window.location.href = labUrl;
    } else {
      navigate(labUrl);
    }
  };

    return (
        <>

    <div className={`group relative overflow-hidden bg-gradient-to-tr from-bg to-bg2 border border-border/20 rounded-xl p-8 h-full flex flex-col group transition-all duration-500`} >

{/* Background Glow */}
      

      <div className={`relative z-10 flex flex-col h-full text-center ${isLanguage ? 'text-primary' : isCareer ? 'text-tertiary' : 'text-secondary'}`}>

        <h3 className="text-3xl font-bold mb-4">{title}</h3>
        <p className="font-semibold mb-8 text-white">{description}</p>

        <div className="space-y-3 mb-10 flex-grow">
          {items.map((item, idx) => (
            <div key={idx} className={`flex items-center gap-3 text-sm  font-semibold `}>
              <div className={`w-2 h-2 rounded-full ${isLanguage ? 'bg-primary' : isCareer ? 'bg-tertiary' : 'bg-secondary'}`} />{item}</div>
          ))}
        </div>

        <button onClick={openLab}
        className={`group/btn relative px-8 py-3 sm:text-base font-semibold rounded-xl overflow-hidden cursor-pointer border-4 ${isLanguage ? 'border-primary' : isCareer ? 'border-tertiary' : 'border-secondary'} hover:border-transparent hover:scale-105 transition-all duration-700`}>

                <span className={`relative z-10 flex items-center justify-center group-hover:text-white ${isLanguage ? 'text-primary' : isCareer ? 'text-tertiary' : 'text-secondary'} gap-2 transition-all duration-700 group-hover:translate-x-2 md:text-xl`}>
                  Explore {title} <ArrowRight className="w-5 h-5 transition-all duration-700 group-hover:translate-x-2" />
                </span>

                <div className={`absolute inset-0 bg-gradient-to-r ${isLanguage ? 'from-blue-800 to-primary ' : isCareer ? 'from-tertiary to-amber-400' : 'from-teal-600 to-secondary'} scale-x-0 origin-left transition-all duration-700 group-hover/btn:scale-x-100`} />

              </button>
      </div>
    </div>

        </>
    )
}

export default LabCard