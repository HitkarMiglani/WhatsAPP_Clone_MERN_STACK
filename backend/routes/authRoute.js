const express = require("express");
const {
  sendOtp,
  verifyOtp,
  updateProfile,
  logout,
  checkAuthentication,
  getAllUsers,
} = require("../controllers/authControler");
const authMiddleware = require("../middleware/authMiddleware");
const { multerMiddleware } = require("../config/cloudnaryConfig");

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.get("/logout", logout);

router.put("/update-profile", authMiddleware, multerMiddleware, updateProfile);
router.get("/check-auth", authMiddleware, checkAuthentication);
router.get("/all-users", authMiddleware, getAllUsers);

module.exports = router;
