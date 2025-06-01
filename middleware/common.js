import { RegisterModel } from "../models/common.js";
import { CommonResponse, varifyToken } from "../utils/common.js";

export const authMiddleware = async (req, res, next) => {
    let commonResponse = new CommonResponse();
    try {
        const token = req.headers.authorization?.split(" ")[1];
        if (token) {
            let decodeToken = varifyToken(token);
            let findDoc = await RegisterModel.findOne({ _id: decodeToken._id, email: decodeToken.email }).lean();
            if (findDoc) {
                if (!req.body) {
                    req.body = {};
                }
                req.body.auth_user_id = findDoc._id;
                next();
            } else {
                commonResponse.status = 'error';
                commonResponse.message = "User Not Authenticated.";
                res.status(401).json(commonResponse);
                return
            }
        } else {
            commonResponse.status = 'error';
            commonResponse.message = "User Not Authenticated.";
            res.status(401).json(commonResponse);
            return;
        }
    } catch (err) {
        commonResponse.status = 'error';
        commonResponse.message = "User Not Authenticated.";
        res.status(401).json(commonResponse);
    }
}