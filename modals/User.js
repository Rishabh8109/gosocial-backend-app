const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const UserSchema = Schema({
    username: {
        type : String,
        min : 3,
        max : 20,
        required : [true , "Please enter the username"]
    },
    password : {
        type : String,
        minLength : [6 , 'Password lenth must be 6'],
        required : [true , "Please enter the password"],
        select : false
    },
    email: {
		type: String,
		required: [true, "Please add a email"],
		unique: true,
		match: [
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
			"Please use a valid email address",
		],
	},
    followers : {
        type : Array,
        default : []
    },
    following : {
        type : Array,
        default : []
    },
    privateAccount : {
        type : Boolean,
        default : false
    },
    profilePicture : {
        type : String,
        default :""
    },
    coverPhoto : {
       type : String,
       default : ""
    },
    resetpasswordToken: String,
	resetpasswordExp: Date,
	createAt: {
		type: Date,
		default: Date.now,
	},
});


// @Encrypt password using bcrypt
UserSchema.pre('save' , async function(next){
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// @Generate token
UserSchema.methods.getSignInWithToken =  function(){
  return  jwt.sign({_id : this._id} , process.env.SECRET_KEY , {
      expiresIn : '1h'
  });
}

// @password compare
UserSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password, this.password);
}


const userModal  = mongoose.model('auth' , UserSchema);
module.exports = userModal;