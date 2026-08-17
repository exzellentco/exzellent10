import React, { useState } from "react";
import { submitContactForm } from "../APIs/contactApi";
import { ArrowRight, Phone, Facebook, Instagram, Linkedin, Mail, Locate, Youtube } from "lucide-react";
import { FaXTwitter, FaWhatsapp } from "react-icons/fa6";
import AnimatedBackground from "../components/AnimatedBackground";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: ""
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  // Validation
  if (!formData.name || !formData.email || !formData.phone || !formData.message) {
    setError("Please fill all fields");
    return;
  }

  setLoading(true);
  setError("");
  setSuccess(false);

  try {
    // Use axios API wrapper instead of fetch
    const data = await submitContactForm(formData);

    if (data.success) {
      setSuccess(true);
      alert("Message sent successfully! We'll reply soon.");

      // Clear form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: ""
      });
    } else {
      setError(data.message || "Failed to send message");
    }
  } catch (err) {
    console.error(err);
    setError(err.message || "Network error. Please check your connection and try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
      <div className="flex mt-0 items-center justify-center min-h-screen px-2 md:px-0 relative">
        <AnimatedBackground className="pointer-events-none" />

        <div className="relative w-full max-w-7xl mt-25 mb-10 mx-8 lg:mt-20 rounded-xl flex lg:flex-row flex-col justify-between overflow-hidden">

          {/* Left Side - Contact Info */}
          <div className="bg-gradient-to-br from-bg2 to-bg w-full p-5 flex flex-col justify-around">
            <div className="flex flex-col gap-2 text-center">
              <p className="md:text-6xl text-5xl text-white font-bold">Contact <span className="text-primary">Us!</span></p>
              <p className="text-xl text-white">We are here to help <span className="text-primary">you!</span></p>
            </div>

            <div className="flex flex-wrap justify-center my-10 gap-10">

                <div className="flex flex-col items-center text-white gap-2 flex-wrap justify-center text-center"> 
                    <div className="text-primary">
                        <Phone size={50}/>
                    </div>
                    <div>
                        <p className="font-bold text-3xl">Phone Number</p>
                        <a href="tel:+4915510400831" target="_blank"
                        className="italic text-xl hover:text-primary cursor-pointer transition-all duration-500">+49 15510 400831</a>
                    </div>
              </div>

              <div className="flex flex-col items-center text-white gap-2 flex-wrap justify-center text-center"> 
                    <div className="text-primary">
                        <Mail size={50}/>
                    </div>
                    <div>
                        <p className="font-bold text-3xl">Email</p>
                        <a href="mailto:info@exzellent.co" target="_blank"
                        className="italic text-xl hover:text-primary cursor-pointer transition-all duration-500">info@exzellent.co</a>
                    </div>
              </div>

              <div className="flex flex-col items-center text-white gap-2 flex-wrap justify-center text-center"> 
                    <div className="text-primary">
                        <Locate size={50}/>
                    </div>
                    <div>
                        <p className="font-bold text-3xl">Location</p>
                        <a href="https://maps.app.goo.gl/sdbhCfSAmLaf7tTQ6" target="_blank"
                        className="italic text-xl hover:text-primary cursor-pointer transition-all duration-500">Brandenburg, Germany</a>
                    </div>
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <p className="text-3xl text-white text-center">Follow <span className="text-primary">Us!</span></p>
              <div className="flex gap-5 items-center justify-center text-white flex-wrap">
                <a href="https://www.facebook.com/profile.php?id=61575114642504" target="_blank" className="hover:text-[#1877F3] text-xl transition-all hover:scale-105 duration-500">
                  <Facebook size={50} />
                </a>
                <a href="https://www.instagram.com/exzellent.co?igsh=MW4xemd6cmlncWJ2NA==" target="_blank" className="hover:text-[#E4405F] text-xl transition-all hover:scale-105 duration-500">
                  <Instagram size={50} />
                </a>
                <a href="https://www.linkedin.com/company/exzellent-co/posts/?feedView=all" target="_blank" className="hover:text-[#0A66C2] text-xl transition-all hover:scale-105 duration-500">
                  <Linkedin size={50} />
                </a>
                <a href="https://www.youtube.com/@exzellentco/featured" target="_blank" className="text-primary hover:text-[#FF0000] text-xl transition-all hover:scale-105 duration-500">
                  <Youtube size={50} />
                </a>
                <a href="https://x.com/Exzellent_co" target="_blank" className="text-primary hover:text-white text-xl transition-all hover:scale-105 duration-500">
                  <FaXTwitter size={50} />
                </a>
                <a href="https://chat.whatsapp.com/I4kpzxYaNeO515YLz3NaJ4" target="_blank" className="text-primary hover:text-green-500 text-xl transition-all hover:scale-105 duration-500">
                  <FaWhatsapp size={50} />
                </a>
              </div>
            </div>
          </div>

          {/* Right Side - Contact Form */}
          <div className="w-full p-5 flex flex-col justify-around gap-5 bg-gradient-to-tr from-bg to-bg2">
      
            <p className="text-5xl text-white text-center font-bold">Let's <span className="text-primary">Talk!</span></p>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input name="name" value={formData.name} onChange={handleChange} required placeholder="Enter your name"
                className="w-full px-5 py-3 border-2 border-border rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-tertiary focus:bg-bg text-sm"/>

              <input name="email" type="email" value={formData.email} onChange={handleChange} required placeholder="Enter your email"
                className="w-full px-5 py-3 border-2 border-border rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-tertiary focus:bg-bg text-sm"/>

              <input name="phone" value={formData.phone} onChange={handleChange} required placeholder="Enter your Phone Number"
                className="w-full px-5 py-3 border-2 border-border rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-tertiary focus:bg-bg text-sm"/>

              <textarea name="message" value={formData.message} onChange={handleChange} required placeholder="A message for us!" rows={4}
                className="w-full px-5 py-3 border-2 border-border rounded-xl text-white placeholder-slate-700 focus:outline-none focus:border-tertiary focus:bg-bg text-sm"/>

              <button type="submit" disabled={loading}
                className="w-full bg-gradient-to-r from-blue-800 to-primary text-white font-semibold  group relative px-8 py-3 sm:text-base rounded-xl overflow-hidden cursor-pointer transition-all duration-700 border-4 border-bg hover:border-primary disabled:opacity-70">
                <span className="relative z-10 flex items-center justify-center text-white group-hover:text-primary gap-2 transition-all duration-700 group-hover:translate-x-2 md:text-2xl">
                  {loading ? "Sending..." : "Submit"}{!loading && <ArrowRight className="w-5 h-5 transition-all duration-700 group-hover:translate-x-1.5" />}
                </span>

                <div className="absolute inset-0 rounded-xl bg-bg scale-x-0 origin-left transition-all duration-500 group-hover:scale-x-100" />
              </button>
            </form>

            {success && (
              <p className="text-secondary text-center font-medium mt-4">Thank you! Your message has been sent.</p>
            )}

            {error && (
              <p className="text-red-800 text-center font-medium mt-4">{error}</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;