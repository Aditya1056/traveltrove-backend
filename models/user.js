const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    places:{
        type:Number,
        default:0
    },
    image:{
        type:String,
        required: true
    },
    slider:[
        {
            type:String
        }
    ],
    wishList:[
        {
            type:mongoose.Types.ObjectId, 
            ref:'Place'
        }
    ]
});

module.exports = mongoose.model('User', userSchema);