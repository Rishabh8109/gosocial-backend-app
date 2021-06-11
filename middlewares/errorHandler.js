const ErrorResponse = require('../utils/ErrorResponse');

const errorHandler = (err,req,res,next) => {
    let error = {...err};
    console.log(error);
}

module.exports = errorHandler;