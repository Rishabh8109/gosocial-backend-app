const express = require('express')
const {
    uploadPost,
    deletePost,
    updateProfile,
    getAllPosts,
    userLike,
    userComments,
    updatePost
} = require('../controllers/Post');
const {isAuthenticated} = require('../middlewares/isAuthorized'); 
const router = express.Router();

router.route('/getAllPost').get(getAllPosts);
router.route('/uploadPost').post(isAuthenticated,uploadPost);
router.route('/update_profile/:userid').post(isAuthenticated,updateProfile);
router.route('/update_post/:postId').post(isAuthenticated , updatePost)
router.route('/delete_post/:postId').delete(isAuthenticated,deletePost);
router.route('/:userid/user_like').post(isAuthenticated, userLike);
router.route('/:postId/comments').post(isAuthenticated,userComments);
module.exports = router;