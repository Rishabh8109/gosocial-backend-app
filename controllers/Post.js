const Posts = require("../modals/Posts");
const User = require("../modals/User");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

// @ desc get  all posts
// @route /api/v1/getAllPosts
// @Acees Private
exports.getAllPosts = async (req, res, next) => {
   try {
        const posts = await Posts.find({})
        .populate({
          path: "auth",
          select: "username profilePicture posts",
        })
        .sort({ createdAt: -1 });
      res.status(200).json({
        success: true,
        data: posts,
      });
   } catch (error) {
     next(new Error(error))
   }
};

// @dec upload posts
// @routes /api/v1/user/upload_post
// Access Private
exports.uploadPost = (req, res, next) => {
  const file = req.files.file;
  const userid = req.userData._id;
  const { desc } = req.body;

  // Make sure file is image
  if (!file.mimetype.startsWith("image")) {
    next(new Error("Please upload a valid image"));
  }

  // Make sure file size is less than to given size
  if (file.size > process.env.FILE_MAX_SIZE) {
    next(
      new Error(`Please upload an image less than ${process.env.FILE_MAX_SIZE}`)
    );
  }

  // coustom file name
  file.name = `photo_${uuidv4()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      next(new Error("Problem with photo"));
    }

    // find user who created Post
    //  const user = await User.findById(userid);

    // @update profile picture and cover photo
    const createPost = await new Posts({
      postImage: `${req.protocol}://${req.get("host")}/uploads/${file.name}`,
      userid: userid,
      description: desc,
    });

    const data = await createPost.save();

    // update the user Schema
    await User.findOneAndUpdate(
      { _id: userid },
      {
        $push: { posts: data },
      },
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      data: data,
    });
  });
};

// @update post
// @routes /api/v1/user/:userid
// @Acess PRIVATe
exports.updateProfile = async (req, res, next) => {
  try {
    const post = await Posts.findOne({ userid: req.params.postId });
    const objectId = post.userid;

    if (objectId.toString() !== req.params.userid) {
      return next(new Error("you are not authorize to change this profile"));
    }

    const updatedPost = await Posts.findOneAndUpdate(
      req.params.userid,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      data: updatedPost,
    });
  } catch (error) {
    next(new Error(error));
  }
};

// update post
// @routes /api/v1/user/:postId

exports.updatePost = async (req, res, next) => {

  const file = req.files.file;
  const userid = req.userData._id;
  const {desc} = req.body;

  if (!file.mimetype.startsWith("image")) {
    next(new Error("Please upload a valid image"));
  }

  // Make sure file size is less than to given size
  if (file.size > process.env.FILE_MAX_SIZE) {
    next(
      new Error(`Please upload an image less than ${process.env.FILE_MAX_SIZE}`)
    );
  }

  // coustom file name
  file.name = `photo_${uuidv4()}${path.parse(file.name).ext}`;

  const filename = `${req.protocol}://${req.get("host")}/uploads/${file.name}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      next(new Error("Problem with photo"));
    }

    const post = await Posts.findById(req.params.postId);

    if (post.userid.toString() !== userid.toString()) {
      next(new Error("You are not able to update this post"));
    } else {
      await Posts.findOneAndUpdate(
        { _id: req.params.postId },
        {
          postImage: filename,
          description: desc,
        },
        {
          new: true,
          runValidators: true,
        }
      );

      res.status(200).json({
        success: true,
        message: "post updated",
      });
    }
  });
};

// @DELETE post
// @routes /api/v1/user/:userid
// @Acess PRIVATE
exports.deletePost = async (req, res, next) => {
  const userId = req.userData._id;
  try {
    const post = await Posts.findById(req.params.postId);

    if (post.userid.toString() !== userId.toString()) {
      next(new Error("You are not able to delete this post"));
    } else {

      await Posts.findOneAndDelete({_id: req.params.postId });
      res.status(200).json({
        success: true,
        message: "post updated",
      });
      
    }
  } catch (error) {
     next(new Error(error))
  }
};

// @desc user likes and deslike
// @routes /api/v1/auth//:id/like
// @ACCESS Private
exports.userLike = async (req, res, next) => {
  const userid = req.userData._id;

  try {
    const post = await Posts.findById(req.params.userid);

    if (!post.likes.users.includes(userid)) {
      await Posts.updateOne({
        $push: { "likes.users": userid },
        $inc: { "likes.count": 1 },
      });
    } else {
      await Posts.updateOne({
        $pull: { "likes.users": userid },
        $inc: { "likes.count": -1 },
      });
    }

    res.status(200).json({
      success: true,
      message: "Post successfuly updated",
      isLiked: true,
    });
  } catch (error) {
    next(new Error(error));
  }
};

// @user comment system
// @Route /api/v1/user/:PostId/comment
// @ACCES PRIVATE

exports.userComments = async (req, res, next) => {
  const postId = req.params.postId;
  const userId = req.userData._id;

  const user = await User.findOne({ _id: userId }).select(
    "_id profilePicture username"
  );

  // update req.body
  req.body.user = user;
  // find the post document
  var query = { _id: postId };

  // push comments on post
  var conditions = { $push: { comments: req.body } };

  // get updated post
  const action = {
    new: true,
    runValidators: true,
  };

  const updatedPost = await Posts.findOneAndUpdate(query, conditions, action);

  res.status(200).json({
    success: true,
    data: updatedPost,
  });
};
