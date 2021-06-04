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
       type : Number,
       default : 0
   },
   comments : [
     {
        user:{
            type :  mongoose.Schema.Types.ObjectId,
            ref : 'auth',
         },
         text : {
             type : String,
             default: ""
         }
     }
   ],
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
    userid : {
        type : mongoose.Schema.Types.ObjectId
    },
    createdAt : {
        type : Date,
        default : Date.now
    } 
});


const Posts =  mongoose.model('Posts' , PostSchema);
module.exports = Posts;