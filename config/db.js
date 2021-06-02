const mongoose = require("mongoose");
const colors = require("colors");

const connectDb = () => {
  mongoose
    .connect(
      `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.lyw5b.mongodb.net/social-media-db?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
      }
    )
    .then((conn) => {
      console.log(`Mongodb connected to ${conn.connection.host}`.bgGreen.white);
    })
    .catch((err) => {
       console.log(err);
       process.exit(1);
    });
};


module.exports = connectDb;