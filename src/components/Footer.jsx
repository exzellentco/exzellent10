import React, { useState } from "react";
import instance from "../utils/axios";
import Swal from "sweetalert2";
import { IoStarSharp } from "react-icons/io5";

const Footer = () => {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await instance.post("/api/newsletter", { email });
      Swal.fire({
        title: "Success!",
        theme: 'dark',
        text: "Thank you for subscribing to our newsletter!",
        icon: "success",
        confirmButtonText: "Cool",
      });
      setEmail("");
    } catch (error) {
      if (error.response?.status === 409) {
        Swal.fire({
          title: "Already Subscribed",
          theme: 'dark',
          text: "You're already subscribed to our newsletter.",
          icon: "info",
          confirmButtonText: "Okay",
        });
      } else {
        Swal.fire({
          title: "Error",
          theme: 'dark',
          text:
            error.response?.data?.message ||
            "An error occurred. Please try again later.",
          icon: "error",
          confirmButtonText: "Okay",
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  /* get current year */

  const currentYear = new Date().getFullYear();

  const legalLinks = [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms & Conditions", href: "/terms" },
    { name: "Data Policy", href: "/data-policy" },
    { name: "Impressum", href: "/impressum" },
  ];

  return (
    <>
      <footer className="sticky w-full bg-bg2 text-white bottom-0 border-t border-border/20 flex lg:flex-row flex-col lg:justify-between px-16 py-10 gap-15">

          <div className="lg:w-1/2 text-center space-y-5">
            <h3 className="text-lg font-semibold ">Stay Updated!</h3>

            <p className="text-white text-sm ">
              Get all the updates on our courses and features!
            </p>

            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              className="w-full px-4 py-3 rounded-xl bg-bg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-secondary text-sm"
            />

            <button
              type="button"
              onClick={handleNewsletterSubmit}
              disabled={submitting}
              className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-800 to-primary text-white font-semibold  hover:from-primary hover:to-primary cursor-pointer transition-all duration-500 hover:scale-105 ${submitting ? "bg-slate-800 cursor-not-allowed" : ""}`}
            >
              {submitting ? "Subscribing..." : "Subscribe"}
            </button>
          </div>

          <div className="lg:w-1/2 flex flex-col items-center gap-10 justify-center">
            <div className="text-center">
              <div className="flex justify-center gap-6 mb-10">
                {legalLinks.map((link, index) => (
                  <a key={index} href={link.href} className="text-text-secondary hover:text-white transition-all duration-300 text-sm" >
                    {link.name}
                  </a>
                ))}
              </div>

              <p className="text-text-secondary text-sm text-center">© {currentYear} Exzellent Learning Platform. All rights reserved.</p>
            </div>

            <div className="flex justify-center lg:mt-0 gap-10 items-center w-1/2">

              <div className="flex flex-col align-center justify-center shrink-0">
                <a href="https://www.trustpilot.com/review/www.exzellent.co" target="_blank"
                  className="bg-white text-green-300 p-2 border text-2xl border-green-300 hover:p-1.5 hover:bg-slate-50 rounded-lg transition-all duration-500 flex gap-1 justify-center">
                  <p className="text-black text-sm">Review us on</p>
                  <IoStarSharp />
                  <span className="font-semibold text-black text-base">Trustpilot</span>
                </a>
              </div>

              <div className="flex flex-col">
                <div className="flex gap-1">
                  <div className="h-5 w-5 bg-bg" />
                  <div className="font-bold">Made</div>
                </div>

                <div className="flex gap-1">
                  <div className="h-5 w-5 bg-red-500" />
                  <div className="font-bold">In</div>
                </div>

                <div className="flex gap-1">
                  <div className="h-5 w-5 bg-yellow-500" />
                  <div className="font-bold">Germany</div>
                </div>
              </div>
            </div>
          </div>
        


      </footer>
    </>
  );
};

export default Footer;
