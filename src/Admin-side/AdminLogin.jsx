import React, { useState } from "react";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../Firebase/Firebase";
import { useNavigate } from "react-router-dom";
import logo from "./images/logo.svg";
import profile from "./images/login-profile.png";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function AdminLogin({ loginHandler }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("User logged in:", userCredential.user);
      loginHandler();
      navigate("/admin/dashboard");
    } catch (error) {
      setError("Invalid email or password");
      console.error("Login error:", error);
    }

    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.warn("Please enter your email address first.");
      return;
    }
  
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset email sent. Please check your inbox.");
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email. Please try again.");
    }
  };
  
  return (
    <div className="flex min-h-screen">
      
      <ToastContainer
  position="bottom-right"
  toastStyle={{
    backgroundColor: "#f8f8f8", // Light grayish-white for minimal look
    color: "#222222", // Soft black for text
    boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)", // Subtle shadow
    borderRadius: "8px", // Slightly rounded corners for modern feel
  }}

  autoClose={3000} // Closes after 3 seconds
/>


      <div
        className="w-full md:w-1/2 bg-cover bg-center bg-no-repeat h-screen"
        style={{ backgroundImage: `url(${profile})` }}
      ></div>

      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-8 rounded-l-3xl shadow-xl">
        <div className="w-full max-w-sm mx-auto">
          <div className="absolute left-8 top-8">
            <img src={logo} alt="Logo" className="w-24" />
          </div>

          <h2 className="text-4xl font-bold text-center mb-8 uppercase">Log In</h2>

          {error && <p className="text-red-500 text-center mb-4">{error}</p>}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-lg font-medium">Email</label>
              <input
                type="email"
                id="email"
                className="w-full p-3 border border-gray-300 rounded-md mt-1"
                placeholder="Enter email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-lg font-medium">Password</label>
              <input
                type="password"
                id="password"
                className="w-full p-3 border border-gray-300 rounded-md mt-1"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-black text-white rounded-md mt-4 hover:bg-gray-800"
              disabled={loading}
            >
              {loading ? "Signing In..." : "Sign In"}
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-blue-600 hover:underline"
              >
                Forgot Password?
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
