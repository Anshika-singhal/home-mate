var jwt = require('jsonwebtoken');
const User = require('../model/user'); // Make sure the model name is capitalized

const userAuth = async (req, res, next) => {
    try {
        const { token } = req.cookies; // Ensure you're sending the token in cookies
        if (!token) {
            return res.status(401).send("Please login "); // Use 401 for unauthorized
        }
        
        // Verify the token
        const decodeObject = await jwt.verify(token, 'shhh'); // Ensure 'shhh' matches your secret
        const { _id } = decodeObject;
        
        // Find the user in the database
        const user = await User.findById(_id);
        if (!user) {
            throw new Error("User Not Found!!!"); // Corrected Error instantiation
        }

        // Set the authenticated user in req.user
        req.user = user; // Use foundUser to set req.user
        next(); // Proceed to the next middleware or route
    } catch (err) {
        console.error("Authentication Error:", err); // Log the error for debugging
        res.status(500).send("Error!" + err.message);
    }
};

module.exports = { userAuth };
