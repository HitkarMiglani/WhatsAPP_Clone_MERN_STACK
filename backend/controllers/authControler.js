const otpGenrate = require("../utils/otpGenrator");
const User = require("../models/User");
const mongoose = require("mongoose");
const response = require("../utils/responseHandler");
const {
  sendOtp: sendOtpService,
  verifyOtp: verifyOtpService,
} = require("../services/twiloService");
const { sendEmail } = require("../services/emailService");
const generateAuthToken = require("../utils/genrateToken");
const { uploadFileToCloudinary } = require("../config/cloudnaryConfig");
const { conversation } = require("../models/conversation");

const sendOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, email } = req.body;
  const otp = otpGenrate();

  const expiry = new Date(Date.now() + 5 * 60 * 1000);
  let user;
  try {
    if (email) {
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ email });
      }

      user.otp = otp;
      user.otpExpiry = expiry;
      await user.save();
      await sendEmail(email, otp);
      return response(res, 200, "OTP sent successfully", { email });
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone number and suffix are required");
      }
      const phone = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });

      if (!user) {
        user = await new User({ phoneNumber, phoneSuffix });
      }
      console.log("Phone number:", phone);

      await sendOtpService(phone);
      await user.save();
      return response(res, 200, "OTP sent successfully", { phone });
    }
  } catch (error) {
    console.error("Error saving user OTP:", error);
    return response(res, 500, "Internal server error");
  }
};

const verifyOtp = async (req, res) => {
  const { phoneNumber, phoneSuffix, otp, email } = req.body;
  let user;

  try {
    if (email) {
      user = await User.findOne({ email });
      if (!user) {
        return response(res, 404, "User not found");
      }

      if (
        !user.otp ||
        String(user.otp) !== String(otp) ||
        new Date(user.otpExpiry) < new Date()
      ) {
        return response(res, 400, "Invalid or expired OTP");
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;

      await user.save();
    } else {
      if (!phoneNumber || !phoneSuffix) {
        return response(res, 400, "Phone number and suffix are required");
      }

      const phone = `${phoneSuffix}${phoneNumber}`;
      user = await User.findOne({ phoneNumber });
      console.log("Phone number:", user);
      if (!user) {
        return response(res, 404, "User not found");
      }

      const verificationStatus = await verifyOtpService(phone, otp);
      console.log("Verification status received:", verificationStatus);

      if (verificationStatus !== "approved") {
        return response(res, 400, "Invalid or expired OTP");
      }

      user.isVerified = true;
      user.otp = null;
      user.otpExpiry = null;
      await user.save();
    }

    const token = generateAuthToken(user._id);

    res.cookie("auth_token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000 * 365,
    });

    return response(res, 200, "OTP verified successfully", {
      user,
      token,
    });
  } catch (error) {
    console.error("Error finding user by email:", error);
    return response(res, 500, "Internal server error");
  }
};

const updateProfile = async (req, res) => {
  const { username, agreed, about } = req.userId;
  const userId = req.user.userId;
  try {
    const user = await User.findById(userId);

    const file = req.file;
    if (user) {
      const uploadeResults = await uploadFileToCloudinary(file);
      user.profilePicture = uploadeResults?.secure_url;
    } else if (req.body.profilePicture) {
      user.profilePicture = req.body.profilePicture;
    }

    if (username) user.username = username;
    if (about) user.about = about;
    if (agreed) user.agreed = agreed;

    await user.save();

    return response(res, 200, "Profile updated successfully", { user });
  } catch (error) {
    console.error("Error updating profile:", error);
    return response(res, 500, "Internal server error");
  }
};

const checkAuthentication = async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return response(res, 401, "User is not authenticated");
    }

    const user = await User.findById(userId);
    if (!user) {
      return response(res, 404, "User not found");
    }

    return response(res, 200, "User is authenticated");
  } catch (error) {
    console.error("Error checking authentication:", error);
    return response(res, 500, "Internal server error");
  }
};

const logout = (req, res) => {
  res.clearCookie("auth-token");
  return response(res, 200, "Logged out successfully");
};

const getAllUsers = async (req, res) => {
  const loggedinUser = req.user?.userId;
  try {
    const users = await User.find({ _id: { $ne: loggedinUser } })
      .select(
        "username profilePicture lastSeen about isOnline phoneNumber phoneSuffix"
      )
      .lean();

    const userswithConversation = await Promise.all(
      users.map(async (user) => {
        const conversation = await Conversation.findOne({
          participants: {
            $all: [loggedinUser, user?._id],
          },
        })
          .populate({
            path: "latestMessage",
            select: "content createdAt sender receiver",
          })
          .lean();

        return {
          ...user,
          conversation: conversation || null,
        };
      })
    );

    return response(res, 200, "Users fetched successfully", userswithConversation);
  } catch (error) {
    console.error("Error fetching users:", error);
    return response(res, 500, "Internal server error");
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  updateProfile,
  logout,
  checkAuthentication,
  getAllUsers,
};
