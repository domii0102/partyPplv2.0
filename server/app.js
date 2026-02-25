import cookieParser from "cookie-parser";
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'node:http';
import './db.js';
import { authMiddleware } from './middleware/authMiddleware.js';



const PORT = parseInt(process.env.PORT);

var app = express();
const server = createServer(app);

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL


app.use(cors({
  origin: CLIENT_BASE_URL,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true
}));
app.use(morgan("dev"));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended: false}));

//dostępne bez zalogowania
//app.use("/api/auth", authRouter);
/*
app.get(["/","/home"], (req, res) => {
  res.send("<h2>Strona główna</h2>");
})*/

app.use(authMiddleware); 


app.use((req, res) => {
    res.status(404).send("<h2>404 - nie znaleziono strony</h2>");
});


app.use((err, req, res, next) => {
 console.error('Unhandled error:', err);
 const status = err.status || 500;
 res.status(status).json({
 error: err.message || 'Internal Server Error'
 });
});

server.listen(PORT, () =>{
  console.log(`Server running at http://localhost:${PORT} `);
});


export default app;
