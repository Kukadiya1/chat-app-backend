import { RegisterModel } from "../models/common.js";
import { CommonResponse, comparePassword, hasPassword, signToken } from "../utils/common.js";
import { loginUserValidation, registerUserValidation } from "../validators/common.js"

export const registerUser = async (req, res) => {
    let commonResponse = new CommonResponse();
    let statusCode = 201;
    try {
        await registerUserValidation.validateAsync(req.body);
        req.body.password = await hasPassword(req.body.password);
        let { _id, email } = await new RegisterModel(req.body).save();
        let token = signToken({ _id, email });
        await RegisterModel.findOneAndUpdate(_id, { token });
        commonResponse.message = 'User Registred Successfully.';
        commonResponse.data = { token };
    }
    catch (err) {
        statusCode = 400;
        commonResponse.status = 'error';
        commonResponse.message = err.message || 'Something Wents Wrong!';
    }
    finally {
        res.status(statusCode).json(commonResponse);
    }
}

export const loginUser = async (req, res) => {
    let commonResponse = new CommonResponse();
    let statusCode = 200;
    try {
        await loginUserValidation.validateAsync(req.body);
        const { email, password } = req.body;
        let findDoc = await RegisterModel.findOne({ email }, { _id: 1, email: 1, password: 1 }).lean();
        if (!findDoc) {
            statusCode = 400;
            commonResponse.message = 'Please Check Your Email And Password.';
            commonResponse.status = 'error';
            return;
        }
        let compare = await comparePassword(password, findDoc.password);
        if (!compare) {
            statusCode = 400;
            commonResponse.status = 'error';
            commonResponse.message = 'Please Check Your Email And Password.';
            return;
        }
        let token = signToken({ _id: findDoc._id, email });
        await RegisterModel.findOneAndUpdate(findDoc._id, { token });
        commonResponse.message = 'User Registred Successfully.';
        commonResponse.data = { token };
    }
    catch (err) {
        statusCode = 400;
        commonResponse.status = 'error';
        commonResponse.message = err.message || 'Something Wents Wrong!';
    }
    finally {
        res.status(statusCode).json(commonResponse);
    }
}

export const getUser = async (req, res) => {
    let commonResponse = new CommonResponse();
    let statusCode = 200;
    try {
        const { auth_user_id } = req.body;
        let findDoc = await RegisterModel.find({ _id: { $ne: auth_user_id } }, { _id: 1, name: 1 }).lean();
        commonResponse.data = findDoc;
    }
    catch (err) {
        statusCode = 400;
        commonResponse.status = 'error';
        commonResponse.message = err.message || 'Something Wents Wrong!';
    }
    finally {
        res.status(statusCode).json(commonResponse);
    }
}