const User = require("../modals/User");

// @desc GET user users content
// @routes /api/v1/auth/users
// @Acess PUBLIC

exports.getUsers = async (req, res, next) => {
  const userData = await User.find({}).select("username profilePicture posts");

  res.status(200).json({
    success: true,
    data: userData,
  });
};

// @desc GET user profile content
// @routes /api/v1/auth/getUserData
// @Acess PRIVATE
exports.getUserProfile = async (req, res, next) => {
  const { _id } = req.userData;
  const userData = await User.findById(_id).populate({
    path: "Posts",
    select: "postImage , userid , likes , comments",
  });
  res.status(200).json({
    success: true,
    data: userData,
  });
};

// @desc follow
// @routes /api/v1/auth/following
// @Acess Private
exports.follow = async (req, res, next) => {
  const userid = req.params.userid;
  const followerUserId = req.userData._id;

  try {
    // get followers detaiils
    const selfUser = await User.findById(followerUserId);
    // get following details
    const currentUser = await User.findById(userid);

    if (!selfUser.following.includes(userid)) {

      // // update $followers field whose are following
      await selfUser.updateOne({
        $push: { following: userid },
      });
      // // Update $following field whose followed
      await currentUser.updateOne({
        $push: { followers: followerUserId },
      });

      res.status(200).json({
        success: true,
      });

    } else {
      // // update $followers field whose are following
      await selfUser.updateOne({
        $pull: { following: userid },
      });
      // // Update $following field whose followed
      await currentUser.updateOne({
        $pull: { followers: followerUserId },
      });
      res.status(200).json({
        success: true,
      });
    }
  } catch (error) {
    next(new Error(error));
  }
};

// @desc follow
// @routes /api/v1/auth/unfollow
// @Acess Private
exports.unfollow = async (req, res, next) => {
  const userid = req.params.userid;
  const followerUserId = req.userData._id;

  try {
    // get followers detaiils
    const selfUser = await User.findById(followerUserId);
    // get following details
    const currentUser = await User.findById(userid);

    if (selfUser.following.includes(userid)) {
      // // update $followers field whose are following
      await selfUser.updateOne({
        $pull: { following: userid },
      });
      // // Update $following field whose followed
      await currentUser.updateOne({
        $pull: { followers: followerUserId },
      });
      res.status(200).json({
        success: true,
      });
    } else {
      res.status(400).json({
        message: 'you cant unfollow',
      });
    }
  } catch (error) {
    next(new Error(error));
  }
};
