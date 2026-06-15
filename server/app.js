import cookieParser from "cookie-parser";
import express from 'express';
import morgan from 'morgan';
import cors from 'cors';
import 'dotenv/config';
import { createServer } from 'node:http';
import './db.js';
import { authMiddleware } from './middleware/authMiddleware.js';
import accountRouter from './routes/account.js';
import userRouter from './routes/user.js';
import eventRouter from './routes/event.js';
import invitationRouter from './routes/invites.js';
import postRouter from './routes/post.js';
import commentRouter from './routes/comment.js';
import notificationRouter from './routes/notification.js';
import { Server } from "socket.io";
import jwt from 'jsonwebtoken';

const CLIENT_BASE_URL = process.env.CLIENT_BASE_URL
const PORT = parseInt(process.env.PORT);
const JWT_SECRET = process.env.JWT_SECRET;

var app = express();
const server = createServer(app);

// Socket setup
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_BASE_URL,
    credentials: true
  }
});

io.use((socket, next) => {
  const cookieHeader = socket.handshake.headers.cookie;
  if (!cookieHeader) return next(new Error('Unauthorized'));

  const cookies = Object.fromEntries(
    cookieHeader.split(';').map(c => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );
  
  const token = cookies['token'];
  if (!token) return next(new Error('Unauthorized'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;
    next();
  } catch { next(new Error('Invalid token')); }
});

io.on('connection', (socket) => {
    console.log(`User connected: ${socket.user.userId}`);

    //Prywatny pokój (dla powiadomień)
    socket.join(`user_${socket.user.userId}`);

    //Pokój eventu (dla aktualizacji forum)
    socket.on('join_event', (eventId) => {
        socket.join(`event_${eventId}`);
        console.log(`User ${socket.user.userId} joined event_${eventId}`);
    });

    socket.on('leave_event', (eventId) => {
        socket.leave(`event_${eventId}`);
        console.log(`User ${socket.user.userId} left event_${eventId}`);
    });

    socket.on('disconnect', () => { console.log(`User disconnected: ${socket.user.userId}`); });
});

export { io };

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

// Dostępne bez zalogowania
app.use("/api/account", accountRouter);
app.use("/api/user", userRouter);
app.use("/api/public", invitationRouter);

app.use(authMiddleware); 

// Event + zaproszenia
app.use("/api/event", eventRouter);
app.use('/api/events/:eventId/invites', invitationRouter);
app.use('/api/invites', invitationRouter);

// Forum (posty + komentarze)
app.use('/api/events/:eventId/forum/posts', postRouter);
app.use('/api/events/:eventId/forum/posts/:postId/comments', commentRouter);

// Powiadomienia
app.use('/api/notifications', notificationRouter);

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

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

export default app;
