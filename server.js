const express = require("express");
const app = express();
const Dotenv = require("dotenv");
const connectDb = require("./config/db");
const colors = require("colors");
const morgan = require("morgan");
const fileUpload = require('express-fileupload');
const createError  = require('http-errors');
const path = require('path');
const cors = require('cors');

// static file
app.use(express.static(path.join(__dirname + '/public')));

// @Route files
const auth = require('./routes/auth');
const post = require('./routes/Post');

// middlewares
app.use(express.json());
app.use(morgan("dev"));
app.use(fileUpload());
app.use(cors());

// mount routes
app.use('/api/v1/auth' , auth);
app.use('/api/v1/user' , post);

// Error handling
app.use(async (req,res,next) => {
   // create error
  next(createError.NotFound());
});


app.use(async (err , req, res, next) => {
   res.status(err.status || 500);
   res.send({
     status : err.status || 500,
     message : err.message
   })
});


// load env var
Dotenv.config({ path: "config/.env" });

// conect to databse
connectDb();

// server listning
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () =>
  console.log(`${process.env.NODE_ENV} port running on ${PORT}`.bgYellow.black)
);

// Handling unhandled promiss rejection
process.on("unhandledRejection", (err, promise) => {
  console.log(`Error ${err.message}`.red.bold);

  // close the server & exit process
  server.close(() => process.exit(1));
});