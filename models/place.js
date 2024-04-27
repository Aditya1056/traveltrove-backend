const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const placeSchema = new Schema({
    title:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    address:{
        type:String,
        required:true
    },
    creator:{
        type: mongoose.Types.ObjectId,
        ref:'User',
        required:true
    },
    location:{
        lat:{
            type:Number,
            required:true
        },
        lng:{
            type:Number,
            required:true
        }
    },
    wishlistedBy:{
        type:Number,
        default: 0
    },
    images:[
        {
            type:String,
        }
    ],
}, {timestamps:true});

module.exports = mongoose.model('Place', placeSchema);