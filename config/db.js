import mongoose from 'mongoose';

export const connectDb = () => {
    return new Promise(async res => {
        try {
            await mongoose.connect(process.env.MONGO_URL);
            console.log("Database Connected.")
            res(true)
        } catch (err) {
            console.log(err);
            res(false)
        }
    })
}