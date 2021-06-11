const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PostSchema = Schema({
   postImage : {
       type : String,
       required : [true, 'Please upload a post']
   },
   description : {
       type : String,
       default : ""
   },
   likes : {
      users : [mongoose.Schema.Types.ObjectId],
      count : {
          type : Number,
          default : 0
      }
   },
   comments : [
     {
        user:{
            type : Object,
            default : []
         },
         text : {
             type : String,
             default: ""
         },
         createdAt : {
             type : Date,
             default : Date.now
         }
     }
   ],
  userid : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'auth'
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
},{
    toJSON : {virtuals : true},
    toObject : {virtuals : true}
  });

  // Revers populating with virtuals
PostSchema.virtual('auth' , {
    ref: 'auth', // The model to use
    localField: "userid", // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`,
    justOne: false,
});



const Posts =  mongoose.model('Posts' , PostSchema);
module.exports = Posts;