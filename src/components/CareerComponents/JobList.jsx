import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "../../UI/carousel.jsx";

const JobList = ({ jobs }) => {
  const navigate = useNavigate();

  const handleJobClick = (jobId) => {
    navigate(`/jobs/${jobId}`);
  };

  const [api, setApi] = useState(null);

  useEffect(() => {
    if (!api) return;

    const interval = setInterval(() => {
      if (api.canScrollNext()) {
        api.scrollNext();
      } else {
        api.scrollTo(0);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [api]);

  const workplaceImages = [
    {
      image:
        "https://res.cloudinary.com/domli7sla/image/upload/v1755863482/workplace_4_azn0fc.jpg",
      title: "Modern Workspace",
      description:
        "State-of-the-art equipment and ergonomic design for maximum comfort and productivity.",
    },
    {
      image:
        "https://res.cloudinary.com/domli7sla/image/upload/v1755863482/workplace_2_aa4wjh.jpg",
      title: "Collaborative Spaces",
      description:
        "Open areas designed for team brainstorming, meetings, and creative synergy.",
    },
    {
      image:
        "https://res.cloudinary.com/domli7sla/image/upload/v1755863482/workplace_3_ws4lty.jpg",
      title: "Relaxation Zone",
      description:
        "Comfortable lounges and break areas to recharge and connect with teammates.",
    },
  ];

  return (
    <div className="bg-bg">
      <section className="pt-28 px-6 max-w-4xl mx-auto text-center mb-8">
        <h1 className="text-6xl md:text-9xl text-white font-bold mb-6">
          Join <span className="text-primary">Us!</span>
        </h1>

        <p className="text-xl text-text-secondary font-bold mx-auto">
          Shape the future of education with a passionate team of innovators.
          Create meaningful impact while building your career in a supportive,
          growth-focused environment.
        </p>
      </section>

      {/* Carousel Section */}

      <section className="py-10 px-6 rounded-xl max-w-6xl mx-auto">
        <Carousel setApi={setApi} opts={{ loop: true }}>
          <CarouselContent>
            {workplaceImages.map((item, index) => (
              <CarouselItem key={index} className="touch-pan-y">
                <div className="relative w-full h-[50vh] sm:h-[70vh] overflow-hidden rounded-xl group">
                  <img
                    src={item.image}
                    alt={item.title}
                    draggable={false}
                    className="w-full h-full object-cover pointer-events-none transition-transform duration-500 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />

                  <div className="absolute bottom-10 left-6 right-6 text-left">
                    <h3 className="text-3xl md:text-4xl font-bold text-white mb-3">
                      {item.title}
                    </h3>
                    <p className="text-lg text-gray-200 max-w-xl">
                      {item.description}
                    </p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          {/* <CarouselPrevious /> */}
          {/* <CarouselNext /> */}
        </Carousel>
      </section>

      {/* Benefits Section */}

      <section className="py-10 px-6 rounded-xl max-w-9xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-8 border-b border-border/20">
        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8 text-center hover:scale-105 hover:-translate-y-10 transition-all duration-500 border border-border/20">
          <h3 className="text-2xl font-bold text-white mb-4">Remote Option</h3>

          <p className="text-text-secondary font-semibold">
            We embrace the possibility of a fully remote-first culture,
            empowering our team to work from anywhere in the world.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8 text-center hover:scale-105 hover:-translate-y-10 transition-all duration-500 border border-border/20">
          <h3 className="text-2xl font-bold text-white mb-4">Flexible Hours</h3>

          <p className="text-text-secondary font-semibold">
            We trust our team to own their time. Whether you're most productive
            at dawn or midnight, design your ideal work rhythm.
          </p>
        </div>

        <div className="bg-gradient-to-tr from-bg to-bg2 rounded-xl p-8 text-center hover:scale-105 hover:-translate-y-10 transition-all duration-500 border border-border/20">
          <h3 className="text-2xl font-bold text-white mb-4">
            Growth & Learning
          </h3>

          <p className="text-text-secondary font-semibold">
            Your development is our priority. Access curated learning paths,
            conference sponsorships, and mentorship programs.
          </p>
        </div>
      </section>

      {/* Jobs Section */}

      <section className="bg-bg2">
        <div className="max-w-7xl mx-auto py-12">
          <div className="text-center mb-20 bg-gradient-to-tr from-bg to-bg py-6 rounded-xl border border-border/20 ">
            <h2 className="text-5xl md:text-6xl font-bold mb-6 text-primary">
              <span className="text-white">Open </span> Positions!
            </h2>

            <p className="text-xl text-text-secondary font-semibold">
              Join our team and help shape the future of language innovation.
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-20 max-w-md mx-auto">
              <h3 className="text-2xl font-semibold text-white mb-3">
                No Open Positions
              </h3>

              <p className="text-lg text-text-secondary font-bold">
                Oops! We're not hiring at the moment.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 mx-8">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="group bg-gradient-to-tr from-bg to-bg border border-border/20  rounded-xl hover:-translate-y-1 transition-all duration-500 overflow-hidden p-8 flex flex-col justify-between"
                >
                  <h3 className="text-2xl font-bold text-primary mb-4 text-center">
                    {job.jobTitle}
                  </h3>

                  <p className="text-sm font-semibold text-text-secondary p-3 mb-6 text-center">
                    {job.department}
                  </p>

                  <p className="text-text-secondary font-semibold mb-8 leading-relaxed line-clamp-4 text-base">
                    {job.jobDescription.length > 160
                      ? `${job.jobDescription.substring(0, 160)}...`
                      : job.jobDescription}
                  </p>

                  <button
                    onClick={() => handleJobClick(job._id)}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-primary text-white font-semibold cursor-pointer transition-all duration-500 hover:scale-105"
                  >
                    View Details & Apply →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default JobList;
