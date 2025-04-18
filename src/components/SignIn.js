import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

const illustrations = [
  "/assets/illustration1.svg",
  "/assets/illustration2.png",
  "/assets/illustration3.png"
];

const SignIn = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState("");
  const [currentIllustration, setCurrentIllustration] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIllustration((prev) => (prev + 1) % illustrations.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handlePasswordToggle = () => setPasswordVisible((prev) => !prev);

  const validateForm = () => {
    let formErrors = { email: "", password: "" };
    let valid = true;
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!formData.email || !emailRegex.test(formData.email)) {
      formErrors.email = "Please enter a valid email address";
      valid = false;
    }
    if (!formData.password || formData.password.length < 6) {
      formErrors.password = "Password must be at least 6 characters long";
      valid = false;
    }
    setErrors(formErrors);
    return valid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      setAlertMessage("Please fix the errors in the form.");
      setAlertType("error");
      return;
    }

    try {
      const response = await fetch("http://192.168.0.235:3002/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: formData.email, password: formData.password }),
      });

      const result = await response.json();

      if (response.ok) {
        if (result.message === "Admin Verified") {
          window.location.href = "http://192.168.0.235";
        } else {
          login(result.sessionId, result.username);
          navigate("/dashboard");
        }
      } else {
        setAlertMessage("Login failed. Please try again.");
        setAlertType("error");
      }
    } catch (error) {
      setAlertMessage("Server error. Please try again.");
      setAlertType("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSSO = () => {
    window.location.href = "http://192.168.0.235:3002/sso/google";
  };

  return (
    <motion.main className="flex h-screen font-sans bg-[#e0e7ff] text-blue-800">
   <motion.div
  className="hidden lg:flex flex-col items-center justify-center w-1/2 bg-gradient-to-b from-[#0E2A66] to-[#0a2050] text-white relative overflow-hidden"
  initial={{ x: -100, opacity: 0 }}
  animate={{ x: 0, opacity: 1 }}
  transition={{ delay: 0.3, duration: 1 }}
>
  {/* Top Heading for eScan */}
  <div className="absolute top-20 px-6 text-center z-10">
    <h1 className="text-5xl font-extrabold tracking-tight">eScan – Secure AI Workspace</h1>
    <p className="text-sm text-indigo-200 mt-1">
      Intelligence meets security in a collaborative environment.
    </p>
  </div>

  {/* AI Illustration */}
  <motion.img
    key={currentIllustration}
    src={illustrations[currentIllustration]}
    alt="AI Collaboration"
    className="max-w-md w-full px-4 drop-shadow-2xl mt-24"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 1, ease: 'easeOut' }}
  />

  {/* Glassmorphic Info Box */}
  <div className="absolute bottom-6 text-center px-12 m-12 backdrop-blur-md bg-white/10 border border-white/20 rounded-xl p-4 shadow-lg">
    <h2 className="text-2xl font-bold tracking-tight text-white">AI-Enhanced Secure Workspace</h2>
    <p className="text-sm text-indigo-100 mt-2">
      Collaborate confidently in an environment powered by intelligent access control, real-time threat detection, and contextual assistance.
    </p>
  </div>

  {/* Floating Blurred Shapes */}
  <motion.div
    className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl"
    animate={{ scale: [1, 1.2, 1], opacity: [0.6, 0.4, 0.6] }}
    transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
  />
  <motion.div
    className="absolute top-20 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl"
    animate={{ y: [0, -20, 0] }}
    transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
  />
</motion.div>



      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        <motion.div
          className="w-full max-w-md bg-white/10 backdrop-blur-2xl border border-white/20 shadow-xl rounded-xl p-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
           <div className="mb-4 text-center">
     <a href="index.html">
         <img src="https://escanav.com/en/images/escan7.png" className="mb-3 w-36 mx-auto drop-shadow-lg" alt="eScan Secure AI Admin Logo" />
     </a>
     <h2 className="text-xl font-bold text-blue-800">eScan Secure AI</h2>
     <p className="text-sm text-blue-800">Sign in to continue.</p>
 </div>

           <motion.button
                     className="w-full flex justify-center items-center gap-2 text-sm text-gray-700 py-2 px-4 rounded-lg border border-gray-300 transition-colors duration-300 mb-4"
                     initial={{ opacity: 0, x: -50 }}
                     animate={{ opacity: 1, x: 0 }}
                     transition={{ delay: 0.7, duration: 0.6 }}
                   >
                     <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="30" viewBox="0 0 48 48">
         <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
         </svg>
                     Sign Up with Google
                   </motion.button>

          <div className="my-4 text-center text-sm text-gray-500">or with email</div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`border border-blue-400 bg-white/20 text-blue-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition hover:bg-white/30 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`border border-blue-400 bg-white/20 text-blue-800 rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition hover:bg-white/30 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={handlePasswordToggle}
                  className="absolute inset-y-0 right-3 flex items-center text-gray-500"
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
            </div>

            <motion.button
              type="submit"
              className="w-full bg-blue-800 text-white font-semibold py-2.5 rounded-lg hover:bg-blue-900 focus:ring-4 focus:ring-blue-300 transition shadow-md"
              whileHover={{ scale: 1.03 }}
            >
              {isSubmitting ? (
                <div className="flex justify-center items-center">
                  <svg className="animate-spin h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </form>
        </motion.div>
      </div>

      {alertMessage && (
        <div
          className={`fixed bottom-6 right-6 w-80 p-4 rounded-lg shadow-lg text-white text-sm z-50 ${
            alertType === "success" ? "bg-green-600" : "bg-red-600"
          }`}
        >
          <p>{alertMessage}</p>
          <button
            className="absolute top-2 right-2 text-xl"
            onClick={() => setAlertMessage("")}
          >
            ×
          </button>
        </div>
      )}
    </motion.main>
  );
};

export default SignIn;
