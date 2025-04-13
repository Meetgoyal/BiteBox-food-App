const mongoose = require('mongoose');
const resSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        street: String,
        city: String,
        state: String,
        country : String,
        zip: String
    },
    menu: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MenuItem'
        }
    ],
    rating: {
        type: Number,
        default: 0
    },
    reviews: [
        {
            customer: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User'
            },
            comment: String,
            rating: Number
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    }
})
module.exports = mongoose.model('Restaurant',resSchema);