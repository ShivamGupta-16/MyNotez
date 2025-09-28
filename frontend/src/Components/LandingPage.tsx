import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { GoogleLogin } from "@react-oauth/google";
import dayjs from "dayjs";

const LandingPage: React.FC = () => {
  const [showOTPInput, setOTPInput] = useState(false);
  const [enteredOTP, setEnteredOTP] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // ✅ Helper: validate email
  function isValidEmail(email: string) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  // ✅ Helper: validate DOB (YYYY-MM-DD or DD MMM YYYY or DD MMMM YYYY)
  function isValidDOB(dob: string) {
    const parsed = dayjs(dob, ["YYYY-MM-DD", "DD MMM YYYY", "DD MMMM YYYY"], true);
    if (!parsed.isValid()) return false;

    const today = dayjs();
    if (parsed.isAfter(today)) return false; // no future DOB
    if (parsed.year() < 1900) return false; // too old

    return true;
  }

  // ✅ Format DOB for backend
  function formatDOB(dob: string) {
    return dayjs(dob, ["YYYY-MM-DD", "DD MMM YYYY", "DD MMMM YYYY"], true).format("YYYY-MM-DD");
  }

  // ✅ Handle OTP flow
  const handleGetOTP = async () => {
    setErrorMessage("");
    setSuccessMessage("");
    setMessage("");

    const Name = (document.getElementById("name-input") as HTMLInputElement)?.value.trim();
    const email = (document.getElementById("email") as HTMLInputElement)?.value.trim();
    const dobRaw = (document.getElementById("DOB") as HTMLInputElement)?.value.trim();

    if (!Name) return setErrorMessage("Please enter your name!");
    if (!dobRaw) return setErrorMessage("Please enter the date of birth!");
    if (!isValidDOB(dobRaw)) return setErrorMessage("Please enter a valid date of birth (YYYY-MM-DD or DD MMM YYYY).");
    if (!email) return setErrorMessage("Please enter your email!");
    if (!isValidEmail(email)) return setErrorMessage("Please enter a valid email.");

    const dob = formatDOB(dobRaw);

    try {
      if (!showOTPInput) {
        // ✅ Request OTP from backend
        const res = await axios.post<{ otp: string }>(
          "https://highwaydelite-28qp.onrender.com/generate-otp-signup",
          { name: Name, email, dob }
        );

        setOTPInput(true);
        setMessage(`Your OTP is: ${res.data.otp}`);
        setSuccessMessage("OTP generated successfully!");
      } else {
        // ✅ Verify OTP
        const res = await axios.post<{ token: string; message?: string }>(
          "https://highwaydelite-28qp.onrender.com/verify-otp-signup",
          { email, otp: enteredOTP }
        );

        if (res.data.token) localStorage.setItem("token", res.data.token);

        setEnteredOTP("");
        setOTPInput(false);
        setSuccessMessage(res.data.message || "Signed up successfully!");
        setMessage("");
        setTimeout(() => navigate("/userPage"), 1500);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.response?.data?.message || "Server error");
    }
  };

  // ✅ Google Login
  const handleGoogleLogin = async (response: any) => {
    setErrorMessage("");
    setSuccessMessage("");
    setMessage("");

    console.log("Google login response:", response);

    try {
      if (!response || !response.credential) {
        return setErrorMessage("Google login failed! No credential received.");
      }

      const res = await axios.post<{ token: string }>(
        "https://highwaydelite-28qp.onrender.com/google-signup",
        { idToken: response.credential }
      );

      if (res.data.token) {
        localStorage.setItem("token", res.data.token);
        setSuccessMessage("Signed up with Google successfully!");
        setTimeout(() => navigate("/userPage"), 1500);
      } else {
        setErrorMessage("Google signup failed: No token returned from server.");
      }
    } catch (err: any) {
      console.error("Google signup error:", err);
      setErrorMessage(err.response?.data?.message || "Server error");
    }
  };

  return (
    <div className="landingPageContainer flex flex-col md:flex-row max-w-full h-screen m-1 border-2 border-gray-600 rounded-3xl px-1 py-1 gap-6 justify-center overflow-hidden">
      {/* Left container */}
      <div className="leftContainer flex flex-col w-full md:w-[44%]">
        <div className="leftContent p-6 md:p-8 w-full md:w-[85%] mx-auto">
          {/* Icon */}
          <div className="w-full flex justify-center md:justify-start md:ml-0 mb-2 ml-40 pl-4 md:pl-0">
            <img src="./top.svg" alt="hd icon" className="w-full h-auto object-contain" />
          </div>

          {/* Sign up */}
          <div className="signup mt-10 md:mt-26 mx-auto md:ml-36 w-full">
            <div className="signupTexts text-center md:text-left">
              <div className="heading mb-3 text-2xl md:text-3xl font-bold">
                <h1>Sign up</h1>
              </div>
              <div className="lineContent font-thin">
                <p className="font-inter">Sign up to enjoy the feature of HD</p>
              </div>
            </div>

            <div className="signupForm w-full mb-2">
              <form className="flex flex-col gap-6 mt-6 mb-2">
                {/* Name */}
                <div className="relative">
                  <fieldset className="border border-gray-300 rounded-md px-3 pt-4 pb-2 focus-within:border-blue-500">
                    <legend className="text-sm text-gray-500 px-1">Your Name</legend>
                    <input type="text" id="name-input" className="w-full focus:outline-none" />
                  </fieldset>
                </div>

                {/* Date of Birth */}
                <div className="relative">
                  <fieldset className="border border-gray-300 rounded-md px-3 pt-4 pb-2 focus-within:border-blue-500">
                    <legend className="text-sm text-gray-500 px-1">Date of Birth</legend>
                    <div className="flex items-center">
                      <img src="./calendar.svg" alt="calendar" className="w-5 h-5 mr-2" />
                      <input
                        type="text"
                        id="DOB"
                        placeholder="11 December 1997"
                        className="w-full focus:outline-none"
                      />
                    </div>
                  </fieldset>
                </div>

                {/* Email */}
                <div className="relative">
                  <fieldset className="border border-gray-300 rounded-md px-3 pt-4 pb-2 focus-within:border-blue-500">
                    <legend className="text-sm text-gray-500 px-1">Email</legend>
                    <input type="text" id="email" className="w-full focus:outline-none" />
                  </fieldset>
                </div>

                {/* OTP */}
                {showOTPInput && (
                  <div className="relative">
                    <fieldset className="border border-gray-300 rounded-md px-3 pt-4 pb-2 focus-within:border-blue-500">
                      <legend className="text-sm text-gray-500 px-1">OTP</legend>
                      <input
                        type="password"
                        onChange={(e) => setEnteredOTP(e.target.value)}
                        className="w-full focus:outline-none"
                      />
                    </fieldset>
                  </div>
                )}

                {/* Buttons */}
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleGetOTP}
                    className="bg-blue-500 rounded-md p-2 text-white"
                  >
                    {showOTPInput ? "Sign up" : "Get OTP"}
                  </button>

                  <div className="flex justify-center mt-4">
                    <GoogleLogin
                      onSuccess={handleGoogleLogin}
                      onError={() => setErrorMessage("Google Login Failed")}
                    />
                  </div>
                </div>
              </form>

              {/* Messages */}
              {errorMessage && (
                <div className="mt-4 p-2 text-sm text-red-600 bg-red-100 border border-red-400 rounded-md text-center">
                  {errorMessage}
                </div>
              )}
              {successMessage && (
                <div className="mt-2 p-2 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md text-center">
                  {successMessage}
                </div>
              )}
              {message && (
                <div className="mt-2 p-2 text-sm text-blue-700 bg-blue-100 border border-blue-400 rounded-md text-center">
                  {message}
                </div>
              )}

              <p className="mt-6 text-center">
                Already have an account?{" "}
                <Link to="/signInPage" className="font-medium underline text-blue-600">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right container */}
      <div className="rightContainer hidden md:flex w-[56%] ml-0 md:ml-9 h-full justify-center">
        <div className="imageContainer w-[90%] md:w-[75%]">
          <img
            src="./wallpaper.svg"
            alt="background"
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
