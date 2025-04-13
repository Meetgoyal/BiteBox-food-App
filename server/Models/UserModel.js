const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  mobile: {
    type: String,
    required: true
  },
  address:
    {
      street: String,
      city: String,
      state: String,
      zip: String
    },
  orderHistory: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    }
  ],
  role: {
    type: String,
    enum: ['customer', 'owner', 'admin'],
    default: 'customer'
  },
  tokens: [{
    token: {
        type: String,
        required: true
    }
}]
},({Timestamps : true}));
userSchema.methods.generateAuthToken = async function () {
    try {
        const secret_key = "MYNAMEISMEETGOYALQWERTYUIOPLKJHGFDSAMNBVCXZ";
        let token = jwt.sign({ _id: this._id, role: this.role }, secret_key);
        this.tokens = this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error)
    }
}
module.exports = mongoose.model('User', userSchema);
