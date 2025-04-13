const mongoose = require('mongoose');
const complaintSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        requires : String
    },
    message : {
        type : String,
        requires : true
    }
})
module.exports = mongoose.model('complaint',complaintSchema);