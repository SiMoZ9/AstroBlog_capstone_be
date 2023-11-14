const express = require('express');
const user = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const verifyToken = require('../middlewares/verifyToken')

const runMiddleware = require('../middlewares/CloudinaryMiddle')
const handleUpload = require('../modules/CloudinaryHandler')

require('dotenv').config()

const {body, validationResult} = require('express-validator')
const jwt = require("jsonwebtoken");

const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const myUploadMiddleware = upload.single("avatar");
const headerUploadMiddleware = upload.single("header");

const userRegisterValidation = [
    body('email').isEmail(),
    body('password').isStrongPassword({
        minSymbols: 1,
        minLowercase: 1,
        minLength: 8,
        minNumbers: 1,
        minUppercase: 1
    }),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty())
            return res.status(400).json({ errors: errors.array() });
        next();
    }
]

user.get('/users', async (req, res) => {

    const users = await userModel.find()

    try {
        res.status(200).send({
            statusCode: 200,
            message: "Success",
            users
        })
    } catch (err) {
        res.status(500).send({
            message: "Internal server error",
            statusCode: 500,
        })
        console.error(err)
    }
})

user.get('/users/me/:token', async (req, res) => {
    const localToken = req.params.token
    const userToken = localToken.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)

    const userEmail = await userModel.findOne({email: payload.email})

    try {
        if (!userEmail) {
            res.status(404).send({
                statusCode: 404,
                message: "Error token not valid"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                userEmail
            })
        }
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }

})

user.get('/users/:id', verifyToken, async (req, res) => {
    const {id} = req.params

    try {
        const userToGet = await userModel.findById(id)
        if (!userToGet) {
            res.status(404).send({
                statusCode: 404,
                message: "User not found"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                userToGet
            })
        }

    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }
})

user.post('/users/create/cloudUpload', async (req, res) => {
    try {
        await runMiddleware(req, res, myUploadMiddleware);
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        res.json(cldRes);
    } catch (error) {
        console.log(error);
        res.send({
            message: error.message
        });
    }
})

user.post('/users/create/cloudUploadHeader', async (req, res) => {
    try {
        await runMiddleware(req, res, headerUploadMiddleware);
        const b64 = Buffer.from(req.file.buffer).toString("base64");
        let dataURI = "data:" + req.file.mimetype + ";base64," + b64;
        const cldRes = await handleUpload(dataURI);
        res.json(cldRes);
    } catch (error) {
        console.log(error);
        res.send({
            message: error.message
        });
    }
})

user.post('/users/create', userRegisterValidation, async (req, res) => {

    // pwd crypting
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    const newUserModel = new userModel({
        userName: req.body.userName,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        avatar: req.body.avatar,
        header: req.body.header,
        instruments: {},
        birth: req.body.birth,
        socials: req.body.socials
    })

    const documentToUpdateId = new mongoose.Types.ObjectId(req.body._id);
    const emailExists = await userModel.findOne({ $or: [
            {email: req.body.email},
            {userName: req.body.userName}
        ], _id: {$ne: documentToUpdateId}});

    if (emailExists) {
        return res.status(400).send({
            statusCode: 400,
            message: 'Email already used'
        });
    }


    try {
        const savedUser = await newUserModel.save()
        res.status(201).send({
            statusCode: 201,
            message: 'User created',
            savedUser
        })
    } catch (err) {
        res.status(500).send({
            message: "Internal server error",
            statusCode: 500,
        })
        console.error(err)
    }

})



user.patch('/users/:token', verifyToken, async (req, res) => {
    const localToken = req.params.token
    const userToken = localToken.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)

    console.log(payload)

    try {

        const userToUpdate = await userModel.findById(payload._id)
        console.log(userToUpdate)

        if (!userToUpdate) {
            res.status(404).send({
                message: 'User not found',
                statusCode: 404
            })
        } else {
            const dataToUpdate = req.body
            const options = {new: true}
            const result = await userModel.findByIdAndUpdate(payload, dataToUpdate, options)

            res.status(200).send({
                statusCode: 200,
                message: 'User updated successfully',
                result
            })
        }
    } catch (err) {
        res.status(500).send({
            message: "Internal server error",
            statusCode: 500,
        })
        console.error(err)
    }
})


user.delete('/users/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const user = await userModel.findByIdAndDelete(id)
        if (!user) {
            return res.status(404).send({
                statusCode: 404,
                message: "User not found or already deleted!"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                message: "User deleted successfully"
            })
        }

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal Server Error"
        })
    }
})

module.exports = user