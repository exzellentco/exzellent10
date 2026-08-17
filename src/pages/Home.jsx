import HeroSection from "../components/HeroSection";
import AnimatedBackground from "../components/AnimatedBackground";
import SponsorsSection from "../components/SponsorsSection";
import Reviews from "../components/Reviews";
import FAQ from "../components/FAQ";
import Vision from "../components/Vision";
import TeachersSection from "../components/TeachersSection";
import StatsComponent from "../components/StatsComponent";
import Options from "../components/OptionsSection";
import { useAnimateOnView } from "../hooks/useAnimateOnView";

const Home = () => {
  const [optionsRef, optionsClass] = useAnimateOnView();
  const [statsRef, statsClass] = useAnimateOnView();
  const [teachersRef, teachersClass] = useAnimateOnView();
  const [visionRef, visionClass] = useAnimateOnView();
  const [reviewsRef, reviewsClass] = useAnimateOnView();
  const [sponsorRef, sponsorClass] = useAnimateOnView();
  const [faqRef, faqClass] = useAnimateOnView();

  return (
    <div>
      <AnimatedBackground className="pointer-events-none" />

      <section id="hero">
        <HeroSection />
      </section>

      {/* Sections with smooth fade-in-up */}
      <section id="options" ref={optionsRef} className={optionsClass}>
        <Options />
      </section>

      <section id="stats" ref={statsRef} className={statsClass}>
        <StatsComponent />
      </section>

      <section
        id="teachers"
        ref={teachersRef}
        className={`mx-4 ${teachersClass}`}
      >
        <TeachersSection />
      </section>

      <section id="vision" ref={visionRef} className={`mx-4 ${visionClass}`}>
        <Vision />
      </section>

      <section id="reviews" ref={reviewsRef} className={`mx-4 ${reviewsClass}`}>
        <Reviews />
      </section>

      <section id="sponsors" ref={sponsorRef} className={sponsorClass}>
        <SponsorsSection />
      </section>

      <section id="faq" ref={faqRef} className={faqClass}>
        <FAQ />
      </section>
    </div>
  );
};

export default Home;
