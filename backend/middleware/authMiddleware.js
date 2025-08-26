const responseHandler =  require("../utils/responseHandler");


const authMiddleware = (req, res, next) => {
  const authToken = req.cookies?.authToken ;
    if (!authToken) {
      return responseHandler(res, 401, "Unauthorized: No token provided");
    }

    try {
      const decoded = jwt.verify(authToken, process.env.JWT_SECRET);
      req.user = decoded;
      console.log("Authenticated user:", req.user);
      next();
    } catch (error) {
        console.error("Token verification failed:", error);
      return response(res, 401, "Unauthorized: Invalid token");
    }
}

module.exports = authMiddleware;
