import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../Firebase/Firebase";

import logo from "../images/photo.png"; // Replace with your logo image path

const AdminNavbar = ({ onLogout }) => {
  // State to control sidebar visibility
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Default is hidden
  const navigate = useNavigate(); // React Router hook to navigate programmatically

  // Toggle sidebar visibility on mobile
  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  // Handle LogOut
  const handleLogOut = async () => {
    try {
      await signOut(auth); // Firebase sign out method
      console.log("User logged out");
      onLogout(); // Trigger the parent logout function
      navigate("/admin/login"); // Redirect to login page
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div
        className={`lg:w-64 w-1/2 bg-white-800 text-black flex flex-col transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "block" : "hidden"
        } sm:block`} // Default hidden on mobile, toggle on mobile
      >
        {/* Logo Section */}
        <div className="p-3 flex items-center justify-center mt-8">
          <img src={logo} alt="Logo" className="w-full h-full rounded-full" />
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 border-r-2 border-gray-500 flex flex-col justify-start mt-4">
          <ul className="space-y-4 px-4">
            <li>
              <NavLink
                to="/admin/dashboard"
                end
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center p-3 bg-black rounded-lg text-white"
                    : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
                }
              >
                <i className="fas fa-tachometer-alt mr-3"></i>
                Dashboard
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/bookings"
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center p-3 bg-black rounded-lg text-white"
                    : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
                }
              >
                <i className="fas fa-box mr-3"></i>
                Bookings
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/services"
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center p-3 bg-black rounded-lg text-white"
                    : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
                }
              >
                <i className="fas fa-cogs mr-3"></i>
                Services
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/admin/gallery"
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center p-3 bg-black rounded-lg text-white"
                    : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
                }
              >
                <i className="fas fa-images mr-3"></i>
                Gallery
              </NavLink>
            </li>
            
            <li>
            <NavLink
              to="/admin/founders"
              className={({ isActive }) =>
                isActive
                  ? "flex items-center p-3 bg-black rounded-lg text-white"
                  : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
              }
            >
              <i className="fas fa-user-tie mr-3"></i> {/* Founder Icon */}
              Organizations
            </NavLink>
          </li>
            {/* New NavLink for Contact Information */}
            <li>
              <NavLink
                to="/admin/contact-information"
                className={({ isActive }) =>
                  isActive
                    ? "flex items-center p-3 bg-black rounded-lg text-white"
                    : "flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
                }
              >
                <i className="fas fa-address-book mr-3"></i> {/* Contact Information Icon */}
                Contact Information
              </NavLink>
            </li>
            {/* Log Out Link */}
            <li>
              <NavLink
                to="#"
                onClick={handleLogOut}
                className="flex items-center p-3 hover:bg-black rounded-lg hover:text-white"
              >
                <i className="fas fa-sign-out-alt mr-3"></i> {/* Log Out Icon */}
                Log Out
              </NavLink>
            </li>
            

          </ul>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
        <Outlet />
      </div>

      {/* Hamburger Menu for Mobile */}
      <div className="lg:hidden absolute left-4 top-4 z-50">
        <button
          className="text-black p-2 bg-white rounded-full shadow-lg"
          onClick={toggleSidebar}
        >
          <i className={`fas ${isSidebarOpen ? "fa-times" : "fa-bars"} text-xl`}></i>
        </button>
      </div>
    </div>
  );
};

export default AdminNavbar;