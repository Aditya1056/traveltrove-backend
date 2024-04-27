const fs = require('fs');
const Place = require('../models/place');
const User = require('../models/user');
const HttpError = require('../models/http-error');

exports.getPlace = async (req, res, next) => {

    const placeId = req.params.placeId;

    try{
        const place = await Place.findById(placeId);

        if(!place){
            throw new HttpError("Place not found for given id", 404);
        }

        const placeFormat = {
            title:place.title,
            description: place.description,
            image1:place.images[0],
            image2:place.images[1] ? place.images[1] : null,
            image3:place.images[2] ? place.images[2] : null,
            image4:place.images[3] ? place.images[3] : null,
            address: place.address,
            creator:place.creator,
            location:place.location
        }
    
        res.status(200).json({message: "Fetched place successfully!", data: placeFormat});
    }
    catch(err){
        next(err);
    }
}

exports.addPlace = async (req, res, next) => {

    try{
        
        const {title, description, address} = req.body;
        const location = JSON.parse(req.body.location);
        const files = req.files;

        if(
            title.trim().length < 3 || 
            description.trim().length === 0 || 
            !files || files.length === 0 || 
            address.trim().length < 5 || 
            !location.lat || !location.lng
        ){
            return next(new HttpError("Entered inputs are invalid!", 422));
        }

        const images = files.map((file) => {
            return file.destination + '/' + file.filename;
        });

        const place = new Place({
            title: title.trim(),
            description: description.trim(),
            address: address.trim(),
            creator: req.userId,
            location: location,
            images:images
        });

        const user = await User.findById(req.userId);

        if(!user){
            throw new HttpError('User not found!', 404);
        }

        const savedPlace = await place.save();

        const slider = [...user.slider];

        if(slider.length < 20){
            slider.push(images[0]);
        }

        user.slider = slider;

        user.places = user.places + 1;

        await user.save();

        res.status(201).json(({message:"Place created successfully!", data: savedPlace}));
    }
    catch(err){
        next(err);
    }
}

exports.updatePlace = async (req, res, next) => {
    
    try{

        const placeId = req.params.placeId;
        
        const {title, description, address} = req.body;
        const location = JSON.parse(req.body.location);
        const files = req.files;

        if(
            title.trim().length < 3 || 
            description.trim().length === 0 || 
            !files || files.length === 0 || 
            address.trim().length < 5 || 
            !location.lat || !location.lng
        ){
            return next(new HttpError("Entered inputs are invalid!", 422));
        }

        const place = await Place.findById(placeId);

        if(!place){
            throw new HttpError("Place not found!", 404);
        }

        const user = await User.findById(req.userId);
        
        if(!user){
            throw new HttpError("User not found!", 404);
        }
        
        if(place.creator.toString() !== req.userId.toString()){
            throw new HttpError("You are not authorized to update this place!", 403);
        }

        place.title = title.trim();
        place.description = description.trim();
        place.address = address.trim();
        place.location = location;

        const oldImages = place.images;
        
        const newImages = files.map((file) => {
            return file.destination + '/' + file.filename;
        });

        let updatedSlider = [...user.slider];
        
        const updationIndex = updatedSlider.findIndex((slide) => {
            return (slide === oldImages[0]);
        });
        
        updatedSlider[updationIndex] = newImages[0];
        
        user.slider = updatedSlider;
        
        await user.save();

        place.images = newImages;

        oldImages.forEach((image) => {
            fs.unlink(image, (err) => {
                console.log(err);
            })
        });

        const savedPlace = await place.save();

        res.status(200).json({message: "Updated place successfully!", data: savedPlace});
    }
    catch(err){
        next(err);
    }
}

exports.deletePlace = async (req, res, next) => {

    const placeId = req.params.placeId;

    try{

        const place = await Place.findById(placeId);

        if(!place){
            throw new HttpError("Place does not exist!", 404);
        }

        const user = await User.findById(req.userId);

        if(!user){
            throw new HttpError("User not found!", 404);
        }

        if(req.userId.toString() !== place.creator.toString()){
            throw new HttpError("You are not authorized to delete this place!", 403);
        }

        const images = place.images;

        images.forEach((image) => {
            fs.unlink(image, (err) => {
                console.log(err);
            });
        });

        await Place.deleteOne({_id: placeId});

        const slider = [...user.slider];

        const updatedSlider = slider.filter((slide) => {
            return slide !== images[0];
        });

        user.slider = updatedSlider;

        user.places = user.places - 1;

        await user.save();

        res.status(200).json({message: "Place deleted successfully!", data: {}});
    }
    catch(err){
        next(err);
    }
}

exports.addToWishlist = async (req, res, next) => {

    try{
        const placeId = req.params.placeId;

        const place = await Place.findById(placeId);
        
        if(!place){
            throw new HttpError('Place not found!', 404);
        }
        
        const user = await User.findById(req.userId);
        
        if(!user){
            throw new HttpError('User not found!', 404);
        }

        const updatedWishlist = [...user.wishList];

        updatedWishlist.push(place._id);

        user.wishList = updatedWishlist;

        await user.save();

        place.wishlistedBy = place.wishlistedBy + 1;

        await place.save();

        res.status(200).json({message: 'Successfully wishlisted the place!', data:{}});
    }
    catch(err){
        next(err);
    }

}

exports.removeFromWishlist = async (req, res, next) => {

    try{
        const placeId = req.params.placeId;

        const place = await Place.findById(placeId);

        if(!place){
            throw new HttpError('Place not found!', 404);
        }
        
        const user = await User.findById(req.userId);
        
        if(!user){
            throw new HttpError('User not found!', 404);
        }

        const wishlist = [...user.wishList];

        const updatedWishlist = wishlist.filter((place) => {
            return place.toString() !== placeId.toString();
        })

        user.wishList = updatedWishlist;

        await user.save();

        place.wishlistedBy = place.wishlistedBy - 1;

        await place.save();

        res.status(200).json({message: 'Successfully removed the place from wishlist!', data:{}});
    }
    catch(err){
        next(err);
    }

}

exports.getUserPlaces =  async (req, res, next) => {
    
    try{
        const userId = req.params.userId;

        const user = await User.findById(userId);

        if(!user){
            throw new HttpError("User not found!", 404);
        }

        const userPlaces = await Place.find({creator: userId}).
            populate('creator', 'name').
            sort({wishlistedBy:-1, createdAt: -1, _id: 1});

        const loggedUser = await User.findById(req.userId).select('wishList');

        const wishList = loggedUser.wishList;

        const updatedUserPlaces = [];

        userPlaces.forEach((place) => {

            const updatedPlace = {
                ...place.toObject(),
                wishlisted: false
            };

            const wishlistPlace = wishList.find((likedPlace) => {
                return likedPlace.toString() === place._id.toString();
            });
            
            if(wishlistPlace){
                updatedPlace.wishlisted = true;
            }

             updatedUserPlaces.push(updatedPlace);
        });

        res.status(200).
        json({
            message: "Fetched " + userId + " places successfully!", 
            data: {
                userPlaces: updatedUserPlaces, 
                userDetails: {
                    _id: user._id,
                    name:user.name,
                    image: user.image,
                    places:user.places
                }
            }
        });
    }
    catch(err){
        next(err);
    }
}