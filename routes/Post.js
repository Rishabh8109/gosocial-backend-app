const express = require('express')
const {
    uploadPost,
    deletePost,
    updateProfile,
    getAllPosts
} = require('../controllers/Post');
const {isAuthenticated} = require('../middlewares/isAuthorized'); 
const router = express.Router();

router.route('/getAllPost').get(getAllPosts);
router.route('/uploadPost').post(isAuthenticated,uploadPost);
router.route('/update_profile/:userid').post(isAuthenticated,updateProfile);
router.route('/delete_post/:userid').delete(isAuthenticated,deletePost);

module.exports = router;