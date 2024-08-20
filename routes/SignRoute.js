const express = require("express");

const {
  Signup,
  getUserData,
  login,
} = require("../services/SignupServices");


const router = express.Router();

const postsRoutes = require("./ProductRoute.js");
const { uploadProfileImage } = require("../middleware/UploadImageMiddleware");

// const router = express.Router({mergeParams : true});

router.post("/signup", Signup);
router.post("/login", login);
router.get("/LoginUser", getUserData);

// router.get("/author/:id", getAuthorById);




// router.route("/image/:id").post(uploadProfileImage, updateprofileimage);

// // to get nested routes
// router.use("/:authorId/posts", postsRoutes);


module.exports = router;
