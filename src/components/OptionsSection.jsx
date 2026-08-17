import LabCard from "./LabCard"

const Options = () => {
    return (
        <>
        <section id="labs" className="relative z-10 max-w-7xl mx-8 xl:mx-auto py-8 ">
        <div className="text-center pb-6">
          <h2 className="text-4xl sm:text-6xl font-extrabold text-secondary mb-4"><span className="text-white">Choose </span>Your Path</h2>
          <p className="text-lg text-white font-semibold mx-auto mb-4">Whether you're looking to bridge <span className="text-primary">cultural</span> gaps or <span className="text-secondary">technical</span> ones, we have a lab for <span className="text-tertiary">you.</span> </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          <LabCard type="language" title="Language Lab" description="Master global languages with our immersive, professional-grade curriculum. From A1 all the way through C2."
            items={['English', 'French', 'Italian', 'German']} href="/labs/language.html"/>

          <LabCard type="career" title="Growth Lab" description="Accelerate your professional trajectory. Master the art of positioning, networking, and global application strategies."
            items={['360° Career Catalyst', 'European CV Mastery', 'Brand Positioning', 'Interview Strategy']} href="/labs/growth-lab.html"/>

            <LabCard type="skills" title="Skills Lab" description="Acquire high-demand technical skills. Master AI, Web3, web-development and Automation to lead your future."
            items={['AI Fundamentals', 'Web3 Development', 'No-Code Automation', 'Vibe Coding']} href="/labs/skill-lab.html"/>

        </div>

      </section>
        </>
    )
}

export default Options