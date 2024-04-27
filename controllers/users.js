const ms = require('ms');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const User = require('../models/user');
const HttpError = require('../models/http-error');

const avatars = [
    'image1.jpg', 'image2.jpg', 'image3.jpg', 'image4.jpg', 'image5.jpg', 
    'image6.jpg', 'image7.jpg', 'image8.jpg', 'image9.jpg', 'image10.jpg'
];


exports.getAllUsers = async (req, res, next) => {

    try{
        const users = await User.find({places :{$gt : 0}}).
            select('-password').
            sort({places: -1, _id: 1});
        res.status(200).json({message: 'Users fetched successfully!', data: users});
    }
    catch(err){
        next(err);
    }
}

exports.getAvatars = (req, res, next) => {
    res.status(200).json({message:"Fetched avatars successfully!", data:avatars});
}

exports.getProfile = async (req, res, next) => {

    try{
        
        const userId = req.params.userId;

        if(userId !== req.userId){
            throw new HttpError("You are not authorized to see this profile!", 403);
        }

        const oldUser = await User.findById(userId).populate('wishList');
        
        const updatedWishList = oldUser.wishList.map((place) => {
            return place._id;
        });

        oldUser.wishList = updatedWishList;

        if(updatedWishList.length === 0){
            oldUser.wishList = [];
        }

        await oldUser.save();

        const user = await User.findById(userId).populate({
            path:'wishList',
            populate:{
                path:'creator',
                select: 'name'
            }
        }).select('-password');

        if(!user){
            throw new HttpError("Profile not found!", 404);
        }

        await user.save();

        res.status(200).json({
            message:"Profile fetched Successfully", 
            data: {
                user:user,
                avatars:avatars
            }
        });
    }
    catch(err){
        next(err);
    }
}

exports.updateUserImage = async (req, res, next) => {
    try{

        const image = req.body.image;
        const user = await User.findById(req.userId);
        if(!user){
            throw new HttpError('User not found!', 404);
        }
        user.image = image;
        await user.save();

        res.status(200).json({message:"User profile picture updated successfully!", data:{}});
    }
    catch(err){
        next(err);
    }
}

exports.signUp = async (req, res, next) => {

    try{

        const email = req.body.email.trim().toLowerCase();
        const password = req.body.password.trim();
        const name = req.body.name.trim();
        const image = req.body.image.trim();

        if(!email.includes('@') || email.length < 6 || password.length < 6 || name.length === 0 || image.length === 0){
            throw new HttpError("Invalid User Details!", 422);
        }

        const user = await User.findOne({email: email});

        if(user){
            throw new HttpError("User already exists! Try different Email.", 403);
        }
        
        const hashedPassword = await bcrypt.hash(password, 12);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            image,
        });

        await newUser.save();

        res.status(201).json({message: "User signed up successfully!", data:{}});
    }
    catch(err){
        next(err);
    }
}

exports.login = async (req, res, next) => {

    try{

        const email = req.body.email;
        const password = req.body.password;

        const user = await User.findOne({email:email});
    
        if(!user){
            throw new HttpError("Email is not valid!", 422);
        }
    
        const isMatched = await bcrypt.compare(password, user.password);
    
        if(!isMatched){
            throw new HttpError("Invalid password!", 422);
        }

        const expiresIn = '1h';

        const token = jwt.sign(
            {userEmail: user.email, userId: user._id}, 
            process.env.JWT_KEY, 
            { expiresIn: expiresIn}
        );
        
        res.status(200).json({
            message: "User successfully logged in!", 
            data: {userId: user._id, userImage:user.image,token:token, expiration: ms(expiresIn)}
        });
    }
    catch(err){
        next(err);
    }
}