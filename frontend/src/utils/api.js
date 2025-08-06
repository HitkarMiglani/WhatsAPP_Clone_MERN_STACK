const API_BASE_URL = "http://localhost:8000/api";

const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;

  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    return {
      success: response.ok,
      data: data,
      status: response.status,
    };
  } catch (error) {
    console.error("API Error:", error);
    return {
      success: false,
      error: "Network error. Please check your connection.",
      status: 0,
    };
  }
};

// Auth API functions
export const authAPI = {
  sendOtp: (phoneNumber, phoneSuffix = "+91") =>
    apiCall("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, phoneSuffix }),
    }),

  sendEmailOtp: (email) =>
    apiCall("/auth/send-otp", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  verifyOtp: (phoneNumber, otp, phoneSuffix = "+91") =>
    apiCall("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, phoneSuffix, otp }),
    }),

  verifyEmailOtp: (email, otp) =>
    apiCall("/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
    }),
};

export default apiCall;
