const mongoose = require('mongoose')

//Describe account collections
module.exports = mongoose.model('Transaction', new mongoose.Schema({
    userId: {type: mongoose.Schema.Types.ObjectId, ref:"user", required:true, maxlength:50},
    account: {type: String, required:true, minlength:8, maxlength:12},
    receiver: {type: String, required:true, minlength:8, maxlength:12},
    amount: {type: Number, required:true, maxlength:15},
}));