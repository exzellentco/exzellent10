import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { LogIn, UserPlus, Menu, X, LogOut } from "lucide-react";
import instance from "../utils/axios"; // Import axios instance
import logo from "../assets/Exzellent_logo.png";

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Update userRole from localStorage
  useEffect(() => {
    setMenuOpen(false);
    const user = JSON.parse(localStorage.getItem("user"));
    setUserRole(user?.userType || null);
  }, [location.pathname]);

  const isLoggedIn = Boolean(userRole);

  const handleLogout = async () => {
    try {
      // Use axios instance instead of fetch for consistency
      const response = await instance.post("/api/users/logout");

      if (response.data.success) {
        // Clear all auth data
        localStorage.removeItem("user");
        localStorage.removeItem("studentData");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

        // Force page reload to clear all state
        window.location.href = "/login"; // Redirect to login page
      } else {
        localStorage.removeItem("user");
        localStorage.removeItem("studentData");
        document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      }
    } catch {
      // Fallback: manually clear cookie and localStorage even if API fails
      document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      localStorage.removeItem("user");
      localStorage.removeItem("studentData");

      // Force page reload to clear all state
      window.location.href = "/login";
    }
  };

let centerNavItems = [];

if (isLoggedIn) {
  if (userRole === "Admin") {
    centerNavItems = [
      { name: "Students", to: "/get-student" },
      { name: "Teachers", to: "/teachers" },
      { name: "Add referral", to: "/add-referral" },
      { name: "Add Course", to: "/add-course" },
      { name: "Courses", to: "/courses" },
      { name: "Add Webinars", to: "/add-webinar" },
      { name: "Free webinars", to: "/webinars" },
      { name: "Add Jobs", to: "/add-job" },
      { name: "Careers", to: "/careers" },
    ];
  } else if (userRole === "Student") {
    centerNavItems = [
      { name: "Dashboard", to: "/student-dashboard" },
      { name: "Courses", to: "/courses" },
      { name: "Free webinars", to: "/webinars" },
    ];
  } else if (userRole === "Teacher") {
    centerNavItems = [
      { name: "Dashboard", to: "/teacher-dashboard" },
      { name: "Careers", to: "/careers" },
    ];
  }
} else {
  centerNavItems = [
    { name: "Home", to: "/" },
    { name: "Careers", to: "/careers" },
    { name: "Learning Ecosystem", href: "/learning-ecosystem.html" },
    { name: "Exzi ✨", href: "/exzi" },
    { name: "Contact Us!", to: "/contact" },
    { name: "Pricing", to: "/offer" },
  ];
}

  const renderNavItem = (item) => {
    const itemClass = `relative p-3 text-white font-bold transition-all duration-500 group overflow-hidden rounded-xl hover:scale-125 hover:text-secondary
    ${location.pathname === item.to ? "scale-125 text-primary" : ""}`;
    const spanClass = `relative z-10 transition-all duration-500  ${location.pathname === item.to ? "text-primary" : ""}`;

    // Static pages (e.g. the Learning Ecosystem HTML in /public) live outside
    // React Router, so they need a real anchor and a full page load.
    if (item.href) {
      return (
        <a key={item.name} href={item.href} className={itemClass}>
          <span className={spanClass}>{item.name}</span>
        </a>
      );
    }

    return (
      <Link key={item.name} to={item.to} className={itemClass}>
        <span className={spanClass}>{item.name}</span>
      </Link>
    );
  };

  return (
    <nav className="fixed bg-bg top-0 w-full p-4 z-50 border-b border-border/20 animate-to-view">

      <div className="flex items-center justify-between w-full">

        <Link to="/" className="relative flex hover:scale-98 transition-all duration-300 h-10">
          <img src={logo} className=" object-cover"/>
        </Link>

        <button className="lg:hidden p-2 focus:outline-none text-text-secondary" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" aria-expanded={menuOpen}>
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <div className="hidden lg:flex flex-1 items-center justify-end space-x-8 px-8">
          {centerNavItems.map(renderNavItem)}
        </div>

        <div className="hidden lg:flex items-center space-x-3">

          {!isLoggedIn ? (

            <>
              <button onClick={() => {navigate("/login")}}
                className="p-3 font-bold text-sm text-primary hover:text-white bg-bg hover:bg-primary border-2 border-primary rounded-2xl transition-all duration-700 flex items-center justify-center gap-2 hover:gap-3 hover:scale-105 cursor-pointer">
                Log in <LogIn className="w-5 h-5" />
              </button>
              
              <button onClick={() => {navigate("/signup")}}
                className="p-3 font-bold text-sm text-secondary hover:text-white bg-bg hover:bg-secondary border-2 border-secondary rounded-2xl transition-all duration-700 flex items-center justify-center gap-2 hover:gap-3 hover:scale-105 cursor-pointer">
                Sign up <UserPlus className="w-5 h-5" />
              </button>
            </>

          ) : (

            <>
              <button onClick={handleLogout} 
                className="p-3 font-bold text-sm text-primary hover:text-white bg-bg hover:bg-primary border-2 border-primary rounded-2xl transition-all duration-700 flex items-center justify-center gap-2 hover:gap-3 hover:scale-105 cursor-pointer">
                Logout <LogOut className="w-5 h-5"/>
              </button>
            </>

          )}

        </div>

      </div>

{/* Mobile menu - improved accessibility and transitions */}
     
        <div className={`lg:hidden transition-all duration-700 ease-in-out rounded-xl mt-1 px-2 pb-2 flex flex-col items-center space-y-2
          ${menuOpen ? "max-h-full opacity-100 pointer-events-auto" : "max-h-0 opacity-0 pointer-events-none" }`} role="menu">

            {centerNavItems.map(renderNavItem)}
            
            {!isLoggedIn ? (
              <>
                <Link to="/login" role="menuitem"
                  className="w-full text-center py-3 text-sm font-semibold border-2 border-primary text-primary rounded-xl flex items-center justify-center gap-2">
                  <LogIn className="w-5 h-5" />Log in
                </Link>
                <Link to="/signup" role="menuitem"
                  className="w-full text-center py-3 text-sm font-semibold bg-gradient-to-r from-blue-800 to-primary text-white rounded-xl flex items-center justify-center gap-2">
                  <UserPlus className="w-5 h-5" />Sign up
                </Link>
              </>
            ) : (
              <button onClick={handleLogout} role="menuitem"
                className="w-full text-center py-3 text-sm font-semibold bg-gradient-to-r from-blue-800 to-primary text-white rounded-xl flex items-center justify-center gap-2">
                Logout
              </button>
            )}
        
        </div>
      
    </nav>
  );
};

export default Navigation;
