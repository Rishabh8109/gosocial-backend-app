const Posts = require("../modals/Posts");
const User = require("../modals/User");
const path = require("path");

// @ desc get  all posts
// @route /api/v1/getAllPosts
// @Acees Private
exports.getAllPosts = async (req, res, next) => {
  const posts = await Posts.find({}).populate({
    path : 'auth',
    select : 'username profilePicture posts'
    
  })
  res.status(200).json({
    success: true,
    data: posts,
  });
};

// @dec upload posts
// @routes /api/v1/user/upload_post
// Access Private
exports.uploadPost = (req, res, next) => {
  const file = req.files.file;
  const userid = req.userData._id;
  const { desc} = req.body;
  

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
   

    // find user who created Post 
    //  const user = await User.findById(userid);
 
    // @update profile picture and cover photo
    const createPost = await new Posts({
      postImage: `${req.protocol}://${req.get('host')}/uploads/${file.name}`,
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
exports.deletePost = async (req, res, next) => {
  const userId = req.params.userid;

  await Posts.findOneAndDelete(userId);

  res.status(200).json({
    succes: true,
    message: "Post deleted successfully",
  });
};

// @desc user likes and deslike
// @routes /api/v1/auth//:id/like
// @ACCESS Private
exports.userLike = async (req, res, next) => {
  const userid = req.userData._id;

  try {
    const post = await Posts.findById(req.params.userid);
    
    if (!post.likes.users.includes(userid)) {
      await Posts.updateOne(
        { 
          $push: { "likes.users": userid},
           $inc : {"likes.count" : 1} 
        }
      );
    } else {
      await Posts.updateOne(
        {
           $pull: { "likes.users": userid },
           $inc : {"likes.count" : -1} 
        }
       );
    }

    res.status(200).json({
      success: true,
      message: "Post successfuly updated",
      isLiked : true
    });
  } catch (error) {
    next(new Error(error));
  }
};



// @user comment system 
// @Route /api/v1/user/:PostId/comment
// @ACCES PRIVATE

exports.userComments = async (req,res,next) => {
    const postId = req.params.postId;
    const userId = req.userData._id;
    
    const user = await User.findOne({_id : userId}).select('_id profilePicture username');
  
    // update req.body
    req.body.user = user;
    // find the post document
    var query = {_id : postId}

    // push comments on post 
    var conditions =  { "$push" : {comments : req.body}}

    // get updated post
    const action =  {
      new : true,
      runValidators : true
    }
    
   const updatedPost = await Posts.findOneAndUpdate(query , conditions, action);

   res.status(200).json({
     success: true,
     data : updatedPost
   })
}