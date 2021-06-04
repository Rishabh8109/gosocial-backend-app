const User = require("../modals/User");

// @desc GET user profile content
// @routes /api/v1/auth/getUserData
// @Acess PRIVATE
exports.getUserProfile = async (req, res, next) => {
  const userData = req.userData;
  res.status(200).json({
    success: true,
    data: userData,
  });
};


// @desc follow
// @routes /api/v1/auth/following
// @Acess Private
exports.following = async (req, res, next) => {
  const userid = req.params.userid;
  const followerUserId = req.userData._id;

  // get followers detaiils
  const followerData = await User.findById(followerUserId)
  .select(
    "username , profilePicture"
   );

  // get following details
  const followingData = await User.findById(userid)
  .select(
    "username , profilePicture"
  );

  try {
    // update $followers field whose are following
    await User.findOneAndUpdate(
      { _id: userid },
      {
        $push: { followers: followerData },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Update $following field whose followed
    await User.findOneAndUpdate(
      { _id: followerUserId },
      {
        $push: { following: followingData },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
    });
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

  // get followers detaiils
  const followerData = await User.findById(followerUserId).select(
    "username , profilePicture"
  );

  // get following details
  const followingData = await User.findById(userid).select(
    "username , profilePicture"
  );

  try {
    // update $followers field whose are following
    await User.findOneAndUpdate(
      { _id: userid },
      {
        $pull: { followers: followerData },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    // Update $following field whose followed
    await User.findOneAndUpdate(
      { _id: followerUserId },
      {
        $pull: { following: followingData },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
    });
  } catch (error) {
    next(new Error(error));
  }
};
