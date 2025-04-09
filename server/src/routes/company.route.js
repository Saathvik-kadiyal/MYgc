const express = require("express");
const router = express.Router();
const companyAuthController = require("../controllers/companyAuth.controller.js");
const companyAuthMiddleware = require("../middleware/companyAuth.middleware.js");
const blockIPMiddleware = require("../middleware/ipblocker.middleware.js");
const loginSignupLimiter = require("../middleware/ratelimit.middleware.js");
const { upload, handleUploadError } = require("../middleware/upload.middleware");

router.post("/signup/initiate", loginSignupLimiter, blockIPMiddleware, companyAuthController.initiateCompanySignup);
router.post("/signup/verify", companyAuthController.verifyCompanySignup);
router.post("/login", loginSignupLimiter, companyAuthController.handleCompanyLogin);
router.get("/profile", companyAuthMiddleware, companyAuthController.getCompanyProfile);
router.put("/profile", companyAuthMiddleware, companyAuthController.updateCompanyProfile);
router.post("/profile/upload", companyAuthMiddleware, upload.single("image"), handleUploadError, companyAuthController.uploadProfilePicture);


module.exports = router;
