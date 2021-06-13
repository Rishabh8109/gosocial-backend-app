const Auth = require("../modals/User");
const path = require("path");
const sendMail = require("../utils/sendMail");
const crypto = require("crypto");
const { v4: uuidv4 } = require('uuid');

// @dec  create user account
// @routes /api/v1/auth/regiser
// Access PUBLIC
exports.register = async (req, res, next) => {
  try {
    const { username, email, password, conformPassword } = req.body;

    if (!username || !email || !password || !conformPassword) {
      next(new Error("Please fill the required field.."));
    }

    // @check if email already exits
    const isEmailExist = await Auth.findOne({ email: email });

    if (isEmailExist) {
      next(new Error("Email already exists"));
    } else {
       // @create user
        const user = await Auth.create({
          username,
          email,
          password,
          conformPassword,
        });

        // @set token into cookie
        setTokenIntoCookie(user, 200, res, "Registered successfully");
    }

   
  } catch (error) {
    next(new Error(error.name));
  }
};

// @dec  create user account
// @routes /api/v1/auth/login
// Access PUBLIC
exports.login = async (req, res, next) => {
  try {
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

    setTokenIntoCookie(user, 200, res, "");
  } catch (error) {
    next(new Error(error));
  }
};

// Set toke into cookie
function setTokenIntoCookie(user, statusCode, res, msg) {
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
    message: msg,
    time : Date.now()
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
  file.name = `photo_${uuidv4()}${path.parse(file.name).ext}`;

  file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
    if (err) {
      next(new Error("Problem with photo"));
    }

    // @Dynamic Object declearation
    let action = {};

    //set dynamic image type
    action[req.query.imageType] = `${req.protocol}://${req.get('host')}/uploads/${file.name}`;

    // @update profile picture and cover photo
    await Auth.findByIdAndUpdate(req.params.userid, action);

    res.status(200).json({
      success: true,
      data: file.name,
    });
  });
};



exports.forgotPassword = async (req, res, next) => {
  const user = await Auth.findOne({ email: req.body.email });

  if (!user) {
    return next(new Error("There is no user found with this email!"));
  }

  const resetToken = await user.getForgotPasswordToken();

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetPassword/${resetToken}`;

  const message = `You are receiving this email because or (someone else) has requested to reset password. Please make a PUT request to : \n\n ${resetUrl}`;

  try {
    await user.save({ validateBeforeSave: false });

    await sendMail({
      email: user.email,
      subject: "Password reset token",
      message: message,
    });

    res.status(200).json({
      success: true,
      message: "Email sent!",
    });
  } catch (error) {
    user.resetpasswordToken = undefined;
    user.resetpasswordExp = undefined;
    await user.save({ validateBeforeSave: false });
    return next(new Error("Email could not be send"));
  }
};



exports.resetPassword = async (req, res, next) => {
  try {
    const resetpasswordToken = crypto
      .createHash("sha256")
      .update(req.params.resetToken)
      .digest("hex");

    const user = await Auth.findOne({
      resetpasswordToken: resetpasswordToken,
    });

    if (!user) {
      next(new Error(`User not found!`));
    }

    user.password = req.body.password;
    user.resetpasswordToken = undefined;
    user.resetpasswordExp = undefined;

    await user.save();

    res.status(200).json({
      sucess: true,
      message: "password successfully updated",
    });
  } catch (error) {
    next(new Error(error));
  }
};
