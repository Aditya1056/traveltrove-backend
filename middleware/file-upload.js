const multer = require('multer');

const storage = multer.diskStorage({
    destination: 'images/uploads',
    filename:(req, file,cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const filter = (req, file, cb) => {
    if(file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg'){
        cb(null, true);
    }
    else{
        const error = new Error('Invalid mime type!');
        cb(error, false);
    }
}

const fileUpload = multer({storage : storage, fileFilter: filter});

module.exports = fileUpload;