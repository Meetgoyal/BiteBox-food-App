const express = require('express');
const router = express.Router();
const User = require('../Models/UserModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
router.post('/signup', async (req, res) => {
    try {
        const isExists = await User.findOne({ email: req.body.email });
        if (isExists) {
            res.status(400).json({
                success: false,
                message: "user already exists"
            })
        }
        else {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            req.body.password = hashedPassword;
            const newUser = await User.create(req.body);
            res.status(200).json({
                success: true,
                message: "user registered Successfully"
            })
        }


    } catch (error) {
        console.log(error);
    }
})

router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user) {
            res.send({
                success: false,
                message: "invalid Email",
                login: false
            })
        }
        const isValidPassword = await bcrypt.compare(req.body.password, user.password);
        if (!isValidPassword) {
            res.send({
                success: false,
                message: "invalid Password",
                login: false
            })
        }
        else {
            const token = await user.generateAuthToken();
            res.cookie("jwtToken", token,
                {
                    path: '/',
                    expires: new Date(Date.now() + 25892000000)
                })
            res.send({
                success: true,
                message: "User Logined Successfully",
                login: true
            })
        }


    } catch (error) {
        console.log(error);
    }
})

router.get('/getData', async (req, res) => {
    try {
        const token = req.query.token;
        if (!token) {
            return res.send({ error: "Unauthorized"});
        }
        else {
            const decoded = jwt.verify(token,"MYNAMEISMEETGOYALQWERTYUIOPLKJHGFDSAMNBVCXZ");
            const currId  = decoded._id;
            const currUser = await User.findOne({ _id : currId }).select('name email role');
            return res.send({ user : currUser });
        }
    } catch (error) {
        console.log(error);
    }
})


module.exports = router;