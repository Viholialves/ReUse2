const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const db = require('../config/db');

const userModel = new User(db);

class UserService {
    async rating(id){
        const id_user = id;
        const rating = await userModel.getRating(id);
        //console.log(rating);
        return {
            rating
        };
    }
}

module.exports = UserService;