import jwt from "jsonwebtoken";
import "dotenv/config";

const JWT_SECRET = process.env.JWT_SECRET;
export function authMiddleware(req, res, next) {

 const token = req.cookies.token;
 
  if (!token) {
    return res.status(401).json({ error: "Token missing" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; //Pola: userId, email, role
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
}
