import axios from "../utils/axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { DateTime } from "luxon";
import AnimatedBackground from "../components/AnimatedBackground";
import { AllWebinarsTab, WebinarCard } from "../UI/Eventtabs";
import { ArrowLeft } from "lucide-react";

const fetchWebinars = async () => {
  try {
    const res = await axios.get("/api/webinars");
    return res.data || [];
  } catch (error) {
    console.error("fetchWebinars error:", error);
    return [];
  }
};

const fetchRegisteredWebinars = async () => {
  try {
    const res = await axios.get("/api/webinars/my-webinars");
    return res.data || [];
  } catch (error) {
    console.error("fetchRegisteredWebinars error:", error);
    return [];
  }
};

const isLoggedIn = () => document.cookie.includes("token=");

const Webinars = () => {
  const navigate = useNavigate();

  const [allWebinars, setAllWebinars] = useState([]);
  const [registeredWebinars, setRegisteredWebinars] = useState([]);
  const [happeningToday, setHappeningToday] = useState([]);
  const [happeningThisMonth, setHappeningThisMonth] = useState([]);
  const [comingUp, setComingUp] = useState([]);
  const [pastWebinars, setPastWebinars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const berlinNow = () => DateTime.now().setZone("Europe/Berlin");

  useEffect(() => {
    const loadWebinars = async () => {
      try {
        setLoading(true);
        setError(null);

        const webinarsData = await fetchWebinars();
        let registeredData = [];

        if (isLoggedIn()) {
          registeredData = await fetchRegisteredWebinars();
        }

        const registeredIds = registeredData
          .filter((w) => w?.registered)
          .map((w) => w._id);

        const registeredWebinarsObjects = webinarsData.filter((w) =>
          registeredIds.includes(w._id),
        );
        const unregisteredWebinars = webinarsData.filter(
          (w) => !registeredIds.includes(w._id),
        );

        const today = berlinNow().startOf("day");

        const sortedRegistered = [...registeredWebinarsObjects].sort(
          (a, b) =>
            DateTime.fromISO(a.scheduledAt).toMillis() -
            DateTime.fromISO(b.scheduledAt).toMillis(),
        );

        const sortedUnregistered = [...unregisteredWebinars].sort(
          (a, b) =>
            DateTime.fromISO(a.scheduledAt).toMillis() -
            DateTime.fromISO(b.scheduledAt).toMillis(),
        );

        const todayEvents = sortedUnregistered.filter((w) =>
          DateTime.fromISO(w.scheduledAt).hasSame(today, "day"),
        );

        const thisMonthEvents = sortedUnregistered.filter((w) => {
          const sched = DateTime.fromISO(w.scheduledAt);
          return (
            !todayEvents.includes(w) &&
            sched >= berlinNow() &&
            sched.hasSame(today, "month")
          );
        });

        const comingUpEvents = sortedUnregistered.filter((w) => {
          const sched = DateTime.fromISO(w.scheduledAt);
          return (
            !todayEvents.includes(w) &&
            !thisMonthEvents.includes(w) &&
            sched >= berlinNow()
          );
        });

        const pastEvents = sortedUnregistered.filter(
          (w) => DateTime.fromISO(w.scheduledAt) < berlinNow(),
        );

        setRegisteredWebinars(sortedRegistered);
        setHappeningToday(todayEvents);
        setHappeningThisMonth(thisMonthEvents);
        setComingUp(comingUpEvents);
        setPastWebinars(pastEvents);
        setAllWebinars(webinarsData);
      } catch (err) {
        setError(err.message || "Failed to load webinars");
      } finally {
        setLoading(false);
      }
    };

    loadWebinars();
  }, []);

  const renderSection = (title, webinars) => {
    if (!webinars?.length) return null;

    return (
      <div className="mb-16">
        <div className="flex items-center gap-4 mb-6">
          <span className="text-base text-secondary font-semibold">
            {webinars.length}
          </span>
          <h3 className="text-2xl sm:text-2xl font-bold text-white">{title}</h3>
          
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {webinars.map((w) => (
            <WebinarCard
              key={w._id}
              webinar={w}
              past={DateTime.fromISO(w.scheduledAt) < berlinNow()}
              onNavigate={(id) => navigate(`/webinars/${id}`)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="relative z-1 mx-auto px-6 sm:px-8 lg:px-10 pt-28 pb-5 text-center space-y-6 bg-bg2 border-b border-border/30">
        <h1 className="text-3xl md:text-6xl font-bold text-white">
          Language <span className="text-primary">Webinars.</span>
        </h1>
        <p className="text-white font-bold text-lg sm:text-xl max-w-3xl mx-auto">
          Join live expert-led sessions and level up your skills — completely
          free!
        </p>

        {!loading &&
          !error &&
          (() => {
            const upcomingCount = allWebinars.filter(
              (w) => DateTime.fromISO(w.scheduledAt) >= berlinNow(),
            ).length;

            return (
              <div className="inline-flex items-center gap-2">
                <span className="text-3xl font-bold text-secondary">
                  {upcomingCount}
                </span>
                <span className="text-base text-white font-semibold">
                  upcoming webinar{upcomingCount !== 1 ? "s" : ""}
                </span>
              </div>
            );
          })()}
      </div>

      <div
        onClick={() => navigate("/courses")}
        className="max-w-lg relative z-1 p-5 cursor-pointer flex justify-start items-center transition-all duration-500 hover:scale-98 text-2xl lg:text-5xl font-bold hover:-translate-x-3">
        <ArrowLeft className="text-white" />
        <p className="text-white ">
          Language <span className="text-primary">Courses</span>
        </p>
      </div>

      <AnimatedBackground />

      <section className="relative py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          {loading ? (
            <div className="min-h-screen flex flex-col justify-center items-center text-center text-3xl">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
              <p className="text-white">Loading Webinars...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16 text-red-600">
              <p className="text-xl font-medium mb-4">Something went wrong</p>
              <p className="mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-blue-700 text-white rounded-2xl hover:bg-primary transition font-medium"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-16">
              {isLoggedIn() &&
                renderSection("Your Registered Webinars", registeredWebinars)}
              {renderSection("Happening Today", happeningToday)}

              {/* Tab component handles This Month + Coming Up + Past */}
              <AllWebinarsTab
                webinars={[
                  ...happeningToday,
                  ...happeningThisMonth,
                  ...comingUp,
                  ...pastWebinars,
                ]}
                loading={loading}
                onNavigate={(id) => navigate(`/webinars/${id}`)}
              />

              {allWebinars.length === 0 && !loading && (
                <div className="text-center py-20 text-text-secondary text-lg">
                  No webinars available at the moment.
                </div>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
};

export default Webinars;
