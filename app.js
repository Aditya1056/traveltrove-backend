const path = require('path');
const fs = require('fs');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const HttpError = require('./models/http-error');

const userRoutes = require('./routes/users');
const placeRoutes = require('./routes/places');

const MONGODB_URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bcrbjgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const PORT = process.env.PORT || 8080;

const app = express();

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Origin, X-Requested-With, Content-Type, Accept, Authorization'
    );
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
    next();
})

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/users', userRoutes);
app.use('/api/places', placeRoutes);

// For routes that dodesn't exist
app.use((req, res, next) => {
    return next(new HttpError("This page does not exist!", 404));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if(req.files){
        req.files.forEach((file) => {
            fs.unlink(file.path, (err) => {
                console.log(err);
            })
        });
    }
    if(res.headerSent){
        return next(error);
    }
    res.status(error.statusCode || 500).
    json({message: error.message || "Something went wrong! Please try again later!"});
});

mongoose.connect(MONGODB_URI).
then(()=>{
    app.listen(PORT);
    console.log('connected to database!');
}).
catch((err) => {
    console.log(err);
});
