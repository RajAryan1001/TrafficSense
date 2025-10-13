const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Name is required"],
    trim: true
  },

  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/\S+@\S+\.\S+/, "Email is invalid"]
  },

  mobile: {
    type: String,
    required: [true, "Mobile number is required"],
    unique: true,
    minlength: [10, "Mobile number must be 10 digits"],
    maxlength: [10, "Mobile number must be 10 digits"],
    match: [/^[0-9]{10}$/, "Mobile number must contain only 10 digits"]
  },

  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [6, "Password must be at least 6 characters"]
  }
}, {
  timestamps: true // optional: createdAt & updatedAt fields
});

const userModel = mongoose.model('User', userSchema);

module.exports = userModel;
