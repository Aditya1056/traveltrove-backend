const express = require('express');

const placesController = require('../controllers/places');

const checkAuth = require('../middleware/check-auth');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/:placeId', checkAuth, placesController.getPlace);

router.post('/', checkAuth, fileUpload.array('images', 4) ,placesController.addPlace);

router.patch('/:placeId', checkAuth, fileUpload.array('images', 4), placesController.updatePlace);

router.delete('/:placeId', checkAuth, placesController.deletePlace);

router.get('/user/:userId', checkAuth, placesController.getUserPlaces);

router.post('/:placeId/wishlist', checkAuth, placesController.addToWishlist);

router.post('/remove/:placeId/wishlist', checkAuth, placesController.removeFromWishlist);

module.exports = router;