import jwt from 'jsonwebtoken';

const auth = (req, res, next) => {
    // Get the token from the Authorization header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    // If no token is found, send a 401 unauthorized response
    if (!token) {
        return res.status(401).json({ message: 'Auth Error' });
    }

    try {
        // Verify the token using the JWT_SECRET environment variable
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Attach the decoded user information to the request object
        req.user = decoded;
        console.log("Decoded token:", decoded);
        console.log("Authenticated user:", req.user);
        
        // Call the next middleware function in the stack
        next();
    } catch (e) {
        // Send a 401 unauthorized response for invalid token
        res.status(401).json({ message: 'Invalid Token' });
    }
}; 

export default auth;
