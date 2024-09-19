import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization').replace('Bearer ', '');
    console.log(decodedToken);
    if (!token) {
        return res.status(401).json({ message: 'Authentication failed!' });
    }
    
    try {
        const decodedToken = jwt.verify(token, JWT_SECRET);
        req.userId = decodedToken.userId;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Authentication failed!' });
    }
};

export default authMiddleware;
