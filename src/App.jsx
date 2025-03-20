import './App.css';
import React, { useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Contact from './pages/Contact';
import Services from './pages/Services';
import AdminNavbar from './Admin-side/layouts/AdminNavbar';
import AdminDashboard from './Admin-side/AdminDashboard';
import AdminLogin from './Admin-side/AdminLogin';
import Bookings from './Admin-side/Bookings';
import AdminGallery from './Admin-side/AdminGallery';
import AdminServices from './Admin-side/AdminServices';
import Gallery from './pages/Gallery';
import AdminContactInformation from './Admin-side/AdminContactInformation';
import Chatbot from './components/Chatbot';
import AdminFounders from './Admin-side/AdminFounders';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const loginHandler = () => {
    setIsLoggedIn(true); // Set login state to true on successful login
  };

  const logoutHandler = () => {
    setIsLoggedIn(false); // Set login state to false on logout
  };

  return (
    <Router>
      <MainRoutes isLoggedIn={isLoggedIn} loginHandler={loginHandler} logoutHandler={logoutHandler} />
    </Router>
  );
}

// Separate component inside <Router> to use useLocation()
function MainRoutes({ isLoggedIn, loginHandler, logoutHandler }) {
  const location = useLocation();
  const isAdminPage = location.pathname.startsWith('/admin'); // Detects admin routes

  return (
    <>
      <Routes>
        {/* User Side Routes */}
        <Route path='/' element={<Navbar />}>
          <Route index element={<Home />} />
          <Route path='gallery' element={<Gallery />} />
          <Route path='about' element={<About />} />
          <Route path='contact' element={<Contact />} />
          <Route path='services' element={<Services />} />
        </Route>

        {/* Admin Side Routes */}
        <Route path='/admin'>
          <Route index element={isLoggedIn ? <Navigate to='/admin/dashboard' /> : <AdminLogin loginHandler={loginHandler} />} />
          
          <Route element={isLoggedIn ? <AdminNavbar onLogout={logoutHandler} /> : <Navigate to='/admin' />} >
            <Route path='dashboard' element={<AdminDashboard />} />
            <Route path='bookings' element={<Bookings />} />
            <Route path='gallery' element={<AdminGallery />} />
            <Route path='contact-information' element = {<AdminContactInformation/>}/>
            <Route path='services' element={<AdminServices />} />
            <Route path='founders' element={<AdminFounders />} />
          </Route>
        </Route>
      </Routes>

      {!isAdminPage && <Chatbot/>}

    </>
  );
}

export default App;
