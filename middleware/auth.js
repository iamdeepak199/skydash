const jwt = require('jsonwebtoken');
const jwtSecret = process.env.JWT_SECRET || "4715aed3c946f7b0a38e6b534a9583628d84e96d10fbc04700770d572af3dce43625dd";

function authenticateToken(req, res, next) {
    const token = req.cookies.token;
    if (!token) {
        return res.redirect('/login'); // Redirect to login if no token is found
    }

    try {
        const decoded = jwt.verify(token, jwtSecret);
        req.admin = decoded.admin; // Store decoded admin information in request object
        next();
    } catch (error) {
        return res.redirect('/login'); // Redirect to login if no token is found
    }
}

module.exports = authenticateToken;