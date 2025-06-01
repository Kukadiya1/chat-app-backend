import bcrypt from 'bcrypt';
import jsonwebtoken from 'jsonwebtoken';
import mongoose from 'mongoose';

export class CommonResponse {
    status = 'success';
    data = null;
    message = null;
}

export const signToken = (payload) => {
    return jsonwebtoken.sign(payload, process.env.JWT_KEY)
}

export const varifyToken = (token) => {
    return jsonwebtoken.verify(token, process.env.JWT_KEY)
}

export const hasPassword = async (password) => {
    const salt = await bcrypt.genSalt(+process.env.SALT_ROUND);
    const hash = await bcrypt.hash(password, salt);
    console.log(hash);
    return hash;
};

export const comparePassword = async (plainPassword, hashedPassword) => {
    let compare = await bcrypt.compare(plainPassword, hashedPassword);
    console.log(compare);
    return compare;
};

export const checkValidMongodbId = (mongoIdList) => {
    return mongoIdList.every(e => mongoose.Types.ObjectId.isValid(e));
}