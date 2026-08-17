import React, { useEffect, useRef, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious} from "../UI/carousel";
import { ArrowRight, Volume2, VolumeX, Play, Pause, Maximize } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TeachersSection = () => {
  const [soundEnabled, setSoundEnabled] = useState(false);
  const navigate = useNavigate()

  const videos = [
    {
      url: "https://res.cloudinary.com/dsgxyezcm/video/upload/v1772471035/Pascale_Video_i4cb5l.mp4",
      name: "Pascale Wagen",
      course: "German class",
    },
    {
      url: "https://res.cloudinary.com/dsgxyezcm/video/upload/v1772027108/Ivonna_Romaniuk_video_1_pr62pi.mp4",
      name: "Ivonna Romaniuk",
      course: "English class",
    },
    {
      url: "https://res.cloudinary.com/dsgxyezcm/video/upload/v1772027127/Ivonna_Romaniuk_video_2_z4wgcv.mp4",
      name: "Ivonna Romaniuk",
      course: "Meditation class",
    },
  ];

  const [embla, setEmbla] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [sectionVisible, setSectionVisible] = useState(false);

  const sectionRef = useRef(null);

  useEffect(() => {
    if (!embla) return;

    const onSelect = () => {
      setActiveIndex(embla.selectedScrollSnap());
    };

    embla.on("select", onSelect);
    onSelect();

    return () => {
      embla.off("select", onSelect);
    };
  }, [embla]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setSectionVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative z-10 my-4 max-w-7xl mx-auto px-4 sm:px-8 md:px-14 py-8">
      <h2 className="text-center text-4xl sm:text-5xl md:text-6xl font-extrabold text-white">
        Hear From <span className="text-primary">Our Teachers</span>
      </h2>

      <Carousel setApi={setEmbla}>
        <CarouselContent>
          {videos.map((video, index) => (
            <CarouselItem key={index}>
              <div className="relative rounded-xl my-4 sm:m-8 w-full flex justify-around">
                <ControlledVideo src={video.url} isActive={activeIndex === index && sectionVisible} soundEnabled={soundEnabled} enableSound={() => setSoundEnabled(true)} 
                onFirstClick={() => embla?.scrollTo(index)} name={video.name} course={video.course}/>
              </div>
            </CarouselItem>
          ))}
          
          <CarouselItem key="cta" className="flex items-center justify-center">
            <div className="relative rounded-xl my-4 sm:m-8 select-none" onClick={() => embla?.scrollTo(videos.length)}>
              <div className="rounded-xl p-8 sm:p-12 text-center max-w-2xl mx-auto">
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 pointer-events-none">Ready to <span className="text-primary">Start Learning?</span></p>
                <p className="text-lg sm:text-xl text-white mb-8 pointer-events-none hidden sm:block">Join our community and experience a personalized learning experience</p>
                <button onClick={() => navigate("/courses")} className="bg-gradient-to-r from-blue-800 to-primary text-white font-bold text-base sm:text-lg p-3 sm:p-5 rounded-xl transition-all hover:scale-105">
                  Get Started Today!
                  <ArrowRight className="inline-block ml-2" size={25} />
                </button>
              </div>
            </div>
          </CarouselItem>
        </CarouselContent>
      </Carousel>

      <div className="text-tertiary flex justify-center animate-bounce-right"><ArrowRight size={50} /></div>
    </section>
  );
};

const ControlledVideo = ({ src, isActive, enableSound, onFirstClick, name, course }) => {
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const hideControlsTimeout = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isActive) {
      video.play().catch(() => {});
      setIsPlaying(true);
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, [isActive]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = isMuted;
    if (!isMuted) video.volume = volume;
  }, [isMuted, volume]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateTime = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("loadedmetadata", updateDuration);

    return () => {
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("loadedmetadata", updateDuration);
    };
  }, []);

  const handlePlayPause = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
      setIsPlaying(false);
    } else {
      video.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  const handleProgressClick = (e) => {
    const video = videoRef.current;
    if (!video) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    video.currentTime = pos * duration;
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
    if (newVolume > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleEnableSound = () => {
    setIsMuted(false);
    enableSound();
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const formatTime = (time) => {
    if (isNaN(time)) return "0:00";
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleInteraction = () => {
    setShowControls(true);
    if (hideControlsTimeout.current) {
      clearTimeout(hideControlsTimeout.current);
    }
    hideControlsTimeout.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  };

  return (
    <div ref={containerRef} className="relative rounded-xl overflow-hidden w-full" onMouseMove={handleInteraction} onTouchStart={handleInteraction}
    onMouseLeave={() => isPlaying && setShowControls(false)}>

      <video ref={videoRef} src={src} muted={isMuted} playsInline className="!object-cover w-full h-full cursor-pointer" onClick={isActive ? handlePlayPause : undefined}/>

      {!isActive && (
        <div className="absolute inset-0 z-10 cursor-pointer" onClick={onFirstClick} />
      )}

      <p className="absolute bottom-1 left-1 bg-bg/60 !text-primary p-2 rounded-lg text-lg sm:text-3xl z-20 select-none">{name}<br/><span className="text-white">{course}</span></p>

      {isMuted && (
        <button onClick={handleEnableSound} className="absolute top-4 right-4 bg-bg/80 !text-primary font-bold px-4 py-2 rounded-xl cursor-pointer animate-bounce z-20">
          <p className="hidden sm:block">Enable Sound</p>
          <Volume2 className="block sm:hidden" size={20} />
        </button>
      )}

      {isActive && (
        <div className={`absolute bottom-0 left-0 right-0 bg-black/80  transition-opacity duration-300 z-20 ${showControls ? "opacity-100" : "opacity-0"}`}>
          <div className="w-full h-1 bg-white/30 rounded-full cursor-pointer mb-3 group" onClick={handleProgressClick}>
            <div className="h-full bg-primary rounded-full relative group-hover:h-1.5 transition-all" style={{ width: `${(currentTime / duration) * 100}%` }}>
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
          </div>

          <div className="flex items-center justify-between text-white px-4">
            <button onClick={handlePlayPause} className="hover:text-primary transition-colors p-1">{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>

            <span className="text-sm">{formatTime(currentTime)} / {formatTime(duration)}</span>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 group">
                <button onClick={toggleMute} className="hover:text-primary transition-colors p-1">{!isMuted && volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}</button>
                <input type="range" min="0" max="1" step="0.1" value={volume} onChange={handleVolumeChange} className="hidden sm:block w-0 group-hover:w-20 transition-all duration-300 accent-primary" />
              </div>

              <button onClick={toggleFullscreen} className="hover:text-primary transition-colors p-1"><Maximize size={20} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachersSection;