const jwt = require('jsonwebtoken');

const HttpError = require('../models/http-error');

const checkAuth = (req, res, next) => {
    try{
        const authHeader = req.get('Authorization'); // Authorization: 'Bearer token'
    
        if(!authHeader){
            throw new HttpError('Authentication failed!', 401);
        }
        
        const token = authHeader.split(' ')[1];
        
        if(!token){
            throw new HttpError('Authentication failed!', 401);
        }
    
        const decodedToken = jwt.verify(token, process.env.JWT_KEY);
        req.userId = decodedToken.userId;
        next();
    }
    catch(err){
        next(err);
    }
}

module.exports = checkAuth;