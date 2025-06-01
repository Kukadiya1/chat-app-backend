import { Schema, mongoose } from "mongoose";

const registerSchema = new Schema({
    name: { type: String, required: true },
    country: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    token: { type: String, default: '' },
    is_online: { type: Boolean, default: false },
}, { timestamps: true });


export const RegisterModel = mongoose.model('users', registerSchema);

const userMessageSchema = new Schema({
    sender_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    receiver_id: { type: Schema.Types.ObjectId, ref: 'users', required: true },
    message: { type: String, required: true },
}, { timestamps: true });

export const UserMessageModel = mongoose.model('user_messages', userMessageSchema);