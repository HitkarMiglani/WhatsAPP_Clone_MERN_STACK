const twilio = require("twilio");

require("dotenv").config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceId = process.env.TWILIO_SERVICE_ID;

console.log("Environment variables check:");
console.log("Account SID:", accountSid ? "✓ Loaded" : "✗ Missing");
console.log("Auth Token:", authToken ? "✓ Loaded" : "✗ Missing");
console.log("Service ID:", serviceId ? "✓ Loaded" : "✗ Missing");

if (!accountSid || !authToken) {
  throw new Error(
    "Twilio credentials are missing. Please check your .env file."
  );
}

const client = twilio(accountSid, authToken);

const sendOtp = async (phoneNumber) => {
  console.log("Sending OTP to:", phoneNumber);
  console.log("Using Service ID:", serviceId);

  if (!phoneNumber || typeof phoneNumber !== "string") {
    throw new Error("Invalid phone number provided");
  }

  const formattedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+${phoneNumber}`;
  console.log("Formatted phone number:", formattedPhone);

  try {
    const response = await client.verify.v2
      .services(serviceId)
      .verifications.create({ to: formattedPhone, channel: "sms" });

    console.log("OTP sent successfully:", response);

    return response;
  } catch (error) {
    console.error("Error sending OTP:", error);
    console.error("Error details:", error.message);
    throw new Error("OTP sending failed");
  }
};

const verifyOtp = async (phoneNumber, otp) => {
  const formattedPhone = phoneNumber.startsWith("+")
    ? phoneNumber
    : `+${phoneNumber}`;

  console.log("Verifying OTP for:", formattedPhone);
  console.log("OTP code:", otp);

  if (!otp || typeof otp !== "string") {
    throw new Error("Invalid OTP code provided");
  }

  try {
    const response = await client.verify.v2
      .services(serviceId)
      .verificationChecks.create({ to: formattedPhone, code: otp });

    console.log("OTP verification response:", response);
    console.log("Verification status:", response.status);

    // Return the status directly for easier comparison
    return response.status;
  } catch (error) {
    console.error("Error verifying OTP:", error);
    console.error("Error code:", error.code);
    console.error("Error status:", error.status);

    // If the verification check was not found, it might mean the original verification expired
    if (error.code === 20404) {
      throw new Error(
        "Verification not found or expired. Please request a new OTP."
      );
    }

    throw new Error("OTP verification failed");
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
};
