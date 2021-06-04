const Posts = require("../modals/Posts");
const path = require("path");

// @ desc get  all posts
// @route /api/v1/getAllPosts
// @Acees Private
exports.getAllPosts = async (req, res, next) => {
  const posts = await Posts.find({});

  res.status(200).json({
    success: true,
    data: posts,
  });
};

// @dec upload posts
// @routes /api/v1/user/upload_post
// Access Private
exports.uploadPost = (req, res, next) => {
  const file = req.files.postImage;
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
  file.name = `photo_${userid}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      next(new Error("Problem with photo"));
    }

    // @update profile picture and cover photo
    const createPost = await new Posts({
      postImage: file.name,
      userid: userid,
      description: desc,
    });

    const data = await createPost.save();

    res.status(200).json({
      success: true,
      data: data,
    });
  });
};

// @update post
// @routes /api/v1/user/:userid
// @Acess PRIVATE

exports.updateProfile = async (req, res, next) => {
  try {
    const post = await Posts.findOne({ userid: req.params.userid });
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

// @DELETE post
// @routes /api/v1/user/:userid
// @Acess PRIVATE

exports.deletePost = async (req,res,next) => {
    const  userId = req.params.userid;

    await Posts.findOneAndDelete(userId);
   
    res.status(200).json({
      succes : true,
      message : 'Post deleted successfully'
    });
    
}