const express = require('express')
const {
    uploadPost,
    deletePost,
    updateProfile,
    getAllPosts,
    userLike,
} = require('../controllers/Post');
const {isAuthenticated} = require('../middlewares/isAuthorized'); 
const router = express.Router();

router.route('/getAllPost').get(getAllPosts);
router.route('/uploadPost').post(isAuthenticated,uploadPost);
router.route('/update_profile/:userid').post(isAuthenticated,updateProfile);
router.route('/delete_post/:userid').delete(isAuthenticated,deletePost);
router.route('/:userid/user_like').post(isAuthenticated, userLike);

module.exports = router;