import React, { useState } from "react";
import { motion } from "framer-motion";
import { FiEye, FiEyeOff } from "react-icons/fi"; // Icons for password visibility
import { useAuth } from "../context/Authcontext";
import { useNavigate } from "react-router-dom";

const SignIn = () => {
  const { login } = useAuth(); 
  const navigate = useNavigate(); 
  const [formData, setFormData] = useState({
   // username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
   // username: "",
    email: "",
    password: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track form submission
  const [alertMessage, setAlertMessage] = useState(""); // For custom alert messages
  const [alertType, setAlertType] = useState(""); // To style success or error alerts

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handlePasswordToggle = () => {
    setPasswordVisible((prev) => !prev);
  };

  const validateForm = () => {
    let formErrors = {  email: "", password: "" };
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
        body: JSON.stringify({
          username: formData.email,
          password: formData.password,
        }),
      });
  
      let result;
      try {
        result = await response.json();
      } catch (jsonError) {
        setAlertMessage(result.message || "Login failed. Please try again.");
      }
  
      if (response.ok) {
        if (result.message === "Admin Verified") {
          window.location.href = "http://192.168.0.235";
        } else {
          login(result.sessionId , result.username);
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
  
  return (
    <motion.main
      className="flex h-screen font-sans text-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      {/* Left side - Brand Section 

      <motion.div
        className="hidden lg:flex items-center justify-center flex-1 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white"
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
      >
        <div className="max-w-lg text-center">
          <img
            src="https://escanav.com/en/images/escan3.png"
            alt="Brand Logo"
            className="w-full h-16 object-contain mb-4"
          />
          <h2 className="text-xl font-semibold">
            Protect Your Devices with Our Cutting-Edge Technology
          </h2>
        </div>
      </motion.div>
*/}
      {/* Right side - Sign Up Form */}
      <div className="w-full bg-[#e0e7ff] flex items-center justify-center p-6 lg:px-12">
        <motion.div
          className="max-w-sm w-full bg-white shadow-xl rounded-lg p-8"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <div className="flex justify-center mb-4">
    <img
      className="h-16 object-contain" // Removed ml-16 and added h-16 for consistent height
      src="https://escanav.com/en/images/escan4.png"
      alt="Brand Logo"
    />
  </div>
          <h1 className="text-xl font-bold mb-4 text-center text-blue-700">
    eScan Secure AI
</h1>
<h2 className="text-sm font-medium mb-6 text-center text-gray-500">
    Enter your credentials to access your account.
</h2>


          {/* Google Sign Up Button */}
          <motion.button
            className="w-full flex justify-center items-center gap-2 bg-gray-100 text-sm text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 border border-gray-300 transition-colors duration-300 mb-4"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="40" height="30" viewBox="0 0 48 48">
<path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
</svg>
            Sign Up with Google
          </motion.button>

          <div className="text-center text-gray-600 mb-4">or with email</div>

          {/* Form Section */}
          <motion.form
            action="#"
            method="POST"
            onSubmit={handleSubmit}
            className="space-y-4"
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
          >
            

            {/* Email Input */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                aria-describedby="email-error"
                className={`mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.email && (
                <p id="email-error" className="text-red-500 text-xs mt-1">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <div className="relative">
                <input
                  type={passwordVisible ? "text" : "password"}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  aria-describedby="password-error"
                  className={`mt-1 p-3 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 transition-colors duration-300 ${
                    errors.password ? "border-red-500" : "border-gray-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={handlePasswordToggle}
                  className="absolute top-1/2 right-3 transform -translate-y-1/2 text-gray-500"
                  aria-label={passwordVisible ? "Hide password" : "Show password"}
                >
                  {passwordVisible ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-500 text-xs mt-1">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              className="w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition-colors duration-300"
              whileHover={{ scale: 1.05 }}
            >
              {isSubmitting ? (
                <div className="flex justify-center">
                  <svg
                    className="animate-spin h-5 w-5 mr-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      fill="currentColor"
                      d="M4 12c0-4.418 3.582-8 8-8s8 3.582 8 8"
                    ></path>
                  </svg>
                </div>
              ) : (
                "Sign In"
              )}
            </motion.button>
          </motion.form>

         {/* <div className="mt-4 text-sm text-center text-gray-600">
            Don't have an account?{" "}
            <motion.a
              href="/signup"
              className="text-blue-600 hover:underline"
              whileHover={{ scale: 1.05 }}
            >
              Sign up here !
            </motion.a>
          </div> */}
        </motion.div>
      </div>

      {/* Custom Alert */}
      {alertMessage && (
        <div
          className={`fixed bottom-4 right-4 p-4 rounded-lg shadow-lg w-80 text-white ${
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
