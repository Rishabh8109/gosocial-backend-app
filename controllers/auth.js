const Auth = require("../modals/User");
const path = require("path");

// @dec  create user account
// @routes /api/v1/auth/regiser
// Access PUBLIC
exports.register = async (req, res, next) => {
  const { username, email, password } = req.body;

  // @check if email already exits
  const isEmailExist = await Auth.findOne({ email: email });

  if (isEmailExist) {
    next(new Error("Email already exists"));
  }

  // @create user
  const user = await Auth.create({
    username,
    email,
    password,
  });


  // @set token into cookie
  setTokenIntoCookie(user, 200, res);
};

// @dec  create user account
// @routes /api/v1/auth/login
// Access PUBLIC
exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new Error("Please provide a email and password"));
  }

  const user = await Auth.findOne({ email: email }).select("+password");

  // Check user emaii exists
  if (!user) {
    return next(new Error("Invalid credatial & email not found"));
  }

  const matchPassword = await user.matchPassword(password);

  if (!matchPassword) {
    return next(new Error("Invalid credential"));
  }

  setTokenIntoCookie(user, 200, res);
};

// Set toke into cookie
function setTokenIntoCookie(user, statusCode, res) {
  const token = user.getSignInWithToken();

  const options = {
    expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  // set cookies
  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token: token,
  });
}

// @dec profile picture upload
// @routes /api/v1/auth/:userid/profile_picture
// Access PUBLIC

exports.profilePictureUpload = async (req, res, next) => {
  const user = Auth.findById(req.params.userid);

  if (!user) {
    next(new Error(`User not found with this id ${req.params.userid}`));
  }

  if (!req.files) {
    next(new Error(`Please upload photo`));
  }

  const file = req.files.file;

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
  file.name = `photo_${req.params.userid}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      next(new Error("Problem with photo"));
    }

    // @Dynamic Object declearation
    let action = {};

    //set dynamic image type
    action[req.query.imageType] = file.name;

    // @update profile picture and cover photo
    await Auth.findByIdAndUpdate(req.params.userid, action);

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
};
