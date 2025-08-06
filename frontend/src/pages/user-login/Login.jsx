import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../../utils/api";

export default function Login() {
  const navigate = useNavigate();
  const [authMethod, setAuthMethod] = useState("phone");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (authMethod === "phone" && !phoneNumber) return;
    if (authMethod === "email" && !email) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let result;
      if (authMethod === "phone") {
        result = await authAPI.sendOtp(phoneNumber);
      } else {
        result = await authAPI.sendEmailOtp(email);
      }

      if (result.success) {
        setSuccess(`OTP sent successfully to your ${authMethod}!`);
        setShowOtpInput(true);
      } else {
        setError(result.data.message || result.error || "Failed to send OTP");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otp) return;

    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      let result;
      if (authMethod === "phone") {
        result = await authAPI.verifyOtp(phoneNumber, otp);
      } else {
        result = await authAPI.verifyEmailOtp(email, otp);
      }

      if (result.success) {
        setSuccess("Login successful!");

        if (result.data.data && result.data.data.token) {
          localStorage.setItem("auth_token", result.data.data.token);
        }

        if (result.data.data && result.data.data.user) {
          localStorage.setItem(
            "user_data",
            JSON.stringify(result.data.data.user)
          );
        }

        console.log("User logged in:", result.data.data.user);

        setTimeout(() => {
          navigate("/chat");
        }, 1500);
      } else {
        setError(result.data.message || result.error || "Invalid OTP");
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToInput = () => {
    setShowOtpInput(false);
    setOtp("");
    setError("");
    setSuccess("");
  };

  const getInputLabel = () => {
    if (authMethod === "phone") {
      return showOtpInput ? "Enter the 6-digit code sent to your phone" : "Enter your phone number to get started";
    } else {
      return showOtpInput ? "Enter the 6-digit code sent to your email" : "Enter your email address to get started";
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 bg-gradient-to-b from-green-100 to-white">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-green-500 rounded-full">
            <svg viewBox="0 0 24 24" width="40" height="40" fill="white">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.893 3.386" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-semibold text-gray-800">
            WhatsApp
          </h1>
          <p className="text-sm text-gray-600">
            {getInputLabel()}
          </p>
        </div>

        <div className="p-6 bg-white rounded-lg shadow-lg">
          {error && (
            <div className="p-3 mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded-md">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 mb-4 text-sm text-green-700 bg-green-100 border border-green-400 rounded-md">
              {success}
            </div>
          )}

          {!showOtpInput ? (
            <form onSubmit={handleSendOtp}>
              <div className="mb-4">
                <div className="flex overflow-hidden border border-gray-300 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setAuthMethod("phone")}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      authMethod === "phone"
                        ? "bg-green-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Phone
                  </button>
                  <button
                    type="button"
                    onClick={() => setAuthMethod("email")}
                    className={`flex-1 px-4 py-2 text-sm font-medium transition-colors ${
                      authMethod === "email"
                        ? "bg-green-500 text-white"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    Email
                  </button>
                </div>
              </div>

              <div className="mb-6">
                {authMethod === "phone" ? (
                  <>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Phone number
                    </label>
                    <div className="flex">
                      <div className="flex items-center px-3 py-2 border border-r-0 border-gray-300 bg-gray-50 rounded-l-md">
                        <span className="text-sm text-gray-600">+91</span>
                      </div>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="9876543210"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-r-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Email address
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      required
                    />
                  </>
                )}
              </div>

              <button
                type="submit"
                disabled={
                  (authMethod === "phone" && !phoneNumber) ||
                  (authMethod === "email" && !email) ||
                  isLoading
                }
                className="flex items-center justify-center w-full px-4 py-2 font-medium text-white transition duration-200 bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  "Send OTP"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleVerifyOtp}>
              <div className="mb-6">
                <label className="block mb-2 text-sm font-medium text-gray-700">
                  Verification code
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Enter 6-digit code"
                  maxLength="6"
                  className="w-full px-3 py-2 text-lg tracking-widest text-center border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={!otp || otp.length !== 6 || isLoading}
                className="flex items-center justify-center w-full px-4 py-2 mb-4 font-medium text-white transition duration-200 bg-green-500 rounded-md hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-b-2 border-white rounded-full animate-spin"></div>
                ) : (
                  "Verify & Continue"
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToInput}
                className="w-full py-2 text-sm font-medium text-green-600 hover:text-green-700"
              >
                Change {authMethod === "phone" ? "phone number" : "email address"}
              </button>
            </form>
          )}
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            By continuing, you agree to WhatsApp's{" "}
            <button className="text-green-600 underline hover:underline hover:text-green-700">
              Terms of Service
            </button>{" "}
            and{" "}
            <button className="text-green-600 underline hover:underline hover:text-green-700">
              Privacy Policy
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
