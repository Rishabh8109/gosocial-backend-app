const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = Schema({
    username: {
        type : String,
        min : 3,
        max : 20,
        required : [true , "Please enter the username"]
    },
    password : {
        type : String,
        minLength : [6 , 'Password length must be 6'],
        required : [true , "Please enter the password"],
        select : false
    },
    conformPassword : {
        type : String,
        minLength : [6 , 'Password length must be 6'],
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
    followerCount : {
        type : Number,
        default : 0
    }, 
    followingCount : {
        type : Number,
        default : 0
    }, 
    privateAccount : {
        type : Boolean,
        default : false
    },
    profilePicture : {
        type : String,
        default :""
    },
    posts : {
        type : [mongoose.Schema.Types.ObjectId],
        ref : 'Posts',
    },
    coverPhoto : {
       type : String,
       default : ""
    },
    lives : {
        type : String,
        default : "",
    },
    from : {
        type : String,
        default : "",
    },
    relationship : {
       type : String,
       default : "",
    },
    resetpasswordToken: String,
	resetpasswordExp: Date,
	createAt: {
		type: Date,
		default: Date.now,
	},
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  });


// @Encrypt password using bcrypt
UserSchema.pre('save' , async function(next){
    if(!this.isModified('password')){
        next();
    }
     
    if(this.password !== this.conformPassword){
      next(new Error('password does not match'))
    } else {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        this.conformPassword = await bcrypt.hash(this.conformPassword, salt);
    }
    next();
});



// @Generate token
UserSchema.methods.getSignInWithToken =  function(){
  return  jwt.sign({_id : this._id} , process.env.SECRET_KEY , {
      expiresIn : '1h'
  });
}


// Generate & Hash token genrate
UserSchema.methods.getForgotPasswordToken = async function(){

	// @Generate Token
	const resetToken = crypto.randomBytes(20).toString('hex');

	// @Hash token and set it to resetPasswordToken
	this.resetpasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

	// Token expiration
	this.resetpasswordExp = new Date() + 10 * 60 * 1000;

	return resetToken;
}

// @password compare
UserSchema.methods.matchPassword = async function(password){
  return await bcrypt.compare(password, this.password);
}

// Revers populating with virtuals
UserSchema.virtual('Posts' , {
    ref: 'Posts', // The model to use
    localField: 'posts', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`,
    justOne: false,
});


const auth  = mongoose.model('auth' , UserSchema);
module.exports = auth;