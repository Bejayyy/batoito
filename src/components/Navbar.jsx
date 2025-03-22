import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { FaBars, FaTimes } from 'react-icons/fa';
import logo from '../images/Nav-bar/logo.png';
import Footer from './Footer';

function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="bg-black shadow-md fixed top-0 w-full z-50">
        <div className="container mx-auto px-4 flex items-center justify-between py-4">
          
          {/* Logo Section */}
          <div className="flex items-center h-full">
            <img src={logo} alt="Noritz Bat Films Logo" className="h-10" />
          </div>

          {/* Hamburger Menu for Mobile */}
          <div className="md:hidden">
            <button onClick={toggleMenu} className="text-white text-2xl">
              {isOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>

          {/* Navigation Links */}
          <ul className={`md:flex space-x-8 items-center absolute md:static bg-black md:bg-transparent top-16 left-0 w-full md:w-auto transition-all duration-300 ease-in-out ${isOpen ? "block" : "hidden"}`}>
            {["Home", "Services", "Gallery", "About"].map((item, index) => (
              <li key={index} className="py-2 md:py-0 text-center md:text-left">
                <NavLink
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  className={({ isActive }) =>
                    isActive
                      ? "text-[#FEAD5F] font-semibold uppercase tracking-wide"
                      : "text-white hover:text-[#FEAD5F] font-semibold uppercase tracking-wide"
                  }
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </NavLink>
              </li>
            ))}

            {/* "Book Now" Button */}
            <li className="py-2 md:py-0 text-center md:text-left">
            <NavLink
  to="/contact"
  className="bg-black text-white border-2 border-white font-semibold px-4 py-2 rounded-full
  hover:bg-[#FEAD5F] hover:text-white hover:border-[#ffff] hover:scale-105
  transition-all duration-300 ease-in-out shadow-md hover:shadow-lg"
onClick={() => setIsOpen(false)}
>
  Book Now!
</NavLink>



            </li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <div className='mt-16'>
        <Outlet />
      </div>
      <Footer />
    </>
  );
}

export default Navbar;
