import joi from 'joi';

export const registerUserValidation = joi.object({
    name: joi.string().min(3).max(30).required(),
    country: joi.string().required(),
    address: joi.string().required(),
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string()
})

export const loginUserValidation = joi.object({
    email: joi.string()
        .email({ minDomainSegments: 2, tlds: { allow: ['com', 'net'] } }),
    password: joi.string()
})

export const messageValidation = joi.object({
    sender_id: joi.string().required(),
    receiver_id: joi.string().required(),
    message: joi.string().required()
})

export const getAllChatValidation = joi.object({
    sender_id: joi.string().required(),
    receiver_id: joi.string().required()
})