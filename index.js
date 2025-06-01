import 'dotenv/config'
import express from 'express';
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { connectDb } from './config/db.js';
import cors from 'cors';
import { corsOptions, socketCorsOptions } from './config/cors.js';
import { getUser, loginUser, registerUser } from './controller/common.js';
import { checkValidMongodbId, comparePassword, hasPassword, varifyToken } from './utils/common.js';
import { authMiddleware } from './middleware/common.js';
import { getAllChatValidation, messageValidation } from './validators/common.js';
import { UserMessageModel } from './models/common.js';
import mongoose from 'mongoose';

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, socketCorsOptions);
const PORT = process.env.PORT;

(async () => {
    await connectDb();
})();

app.use(express.json());
app.use(cors(corsOptions));

app.get('/', async (req, res) => {
    res.end("Api Working");
});
app.post('/api/register', registerUser);
app.post('/api/login', loginUser);
app.get('/api/get_user', authMiddleware, getUser);

const userMap = new Map();

io.use((socket, next) => {
    const token = socket.handshake.query.token;

    if (!token) {
        console.log('❌ No token provided');
        return next(new Error('Authentication error'));
    }

    try {
        const decoded = varifyToken(token);
        socket.user = decoded; // Attach decoded user to socket
        userMap.set(socket.id, decoded._id);
        console.log('✅ Authenticated:', decoded);
        next();
    } catch (err) {
        console.log('❌ Invalid token');
        next(new Error('Authentication error'));
    }
});

const emitActiveUser = () => {
    let user = [];
    userMap.forEach((v, k) => {
        user.push({ user_id: v });
    });
    io.emit("send_active_users", user);
}

io.on("connection", (socket) => {
    socket.emit('user_id', socket.user._id)

    socket.on("active_users", async (message) => {
        emitActiveUser();
    });

    socket.on("all_chat", async (message) => {
        try {
            let parseObj = message;
            await getAllChatValidation.validateAsync(parseObj);
            let checkValidId = checkValidMongodbId(Object.values(parseObj));
            if (!checkValidId) {
                socket.emit('send_message_error', 'Pass Valid User Id.');
                return;
            }
            let data = await UserMessageModel
                .find(
                    {
                        $or: [
                            { sender_id: new mongoose.Types.ObjectId(parseObj.sender_id), receiver_id: new mongoose.Types.ObjectId(parseObj.receiver_id) },
                            { sender_id: new mongoose.Types.ObjectId(parseObj.receiver_id), receiver_id: new mongoose.Types.ObjectId(parseObj.sender_id) }
                        ]
                    },
                    {
                        sender_id: 1,       // include message field
                        receiver_id: 1,     // include createdAt field
                        message: 1,     // include sender_id (optional)
                        createdAt: 1,   // include receiver_id (optional)
                        _id: 0            // exclude _id (optional)
                    }
                )
                .sort(
                    { createdAt: 1 }
                ).lean();
            socket.emit('send_all_chat', data);

        } catch (err) {
            socket.emit('send_message_error', 'Not A Valid Message.')
        }
        console.log(`Message received: ${message}`);
    });

    socket.on("message", async (message) => {
        try {
            let parseObj = message;
            await messageValidation.validateAsync(parseObj);
            let checkValidId = checkValidMongodbId([parseObj.sender_id, parseObj.receiver_id]);
            if (!checkValidId) {
                socket.emit('send_message_error', 'Pass Valid User Id.');
                return;
            }
            let data = await new UserMessageModel(parseObj).save();
            let socketId = [];
            userMap.forEach((v, k) => {
                if (parseObj.receiver_id == v || parseObj.sender_id == v) {
                    socketId.push(k);
                }
            });
            if (socketId.length) {
                socketId.forEach(id => {
                    io.to(id).emit('send_message', { ...parseObj, createdAt: data.createdAt });
                });
            }

        } catch (err) {
            socket.emit('send_message_error', 'Not A Valid Message.')
        }
        console.log(`Message received: ${message}`);
    });

    socket.on("disconnect", () => {
        userMap.delete(socket.id);
        emitActiveUser();
        console.log("A user has disconnected");
    });
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});