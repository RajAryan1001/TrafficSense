const express = require('express');
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// register 
router.post('/register', async (req, res) => {
  try {
    let { name, email, mobile, password } = req.body;
    if (!name || !email || !mobile || !password) {
      return res.status(401).json({ message: "All Fields are required" })
    }
    let existingUser = await userModel.findOne({ $or: [{email} ,{mobile} ]});
    if (existingUser) {
      return res.status(409).json({ message: "User Allready Exits" });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await userModel.create({
      name,
      email,
      mobile,
      password: hashedPassword,
    })

    return res.status(201).json({ message: "User Registered" });

  } catch (error) {
    console.log('Register Error', error);
  }
})

//  Login 

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await userModel.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    
    const token = jwt.sign(
      { userId: user._id, email: user.email }, 
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.cookie("Token",token)

    return res.status(200).json({ message: `Welcome ${user.name}`, token });

  } catch (error) {
    console.log("Login Error:", error);
    return res.status(500).json({ message: "Server Error" });
  }
});


module.exports = router;  