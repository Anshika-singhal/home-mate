var jwt = require('jsonwebtoken');
const user=require('../models/user')
const userAuth = async (res, req, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(400).send("Please login ");
        }
        const decodeObject = await jwt.verify(token, 'shhh');
        const { _id } = decodeObject;
        const user = await users.findById(_id);
        if (!user) {
            throw new error("User Not Found!!!");
        }
        req.user = user;
        next();
    }

    catch (err) {
        res.status(500).json({message:"server error", error:err.message})
    }
}

module.export = { userAuth };