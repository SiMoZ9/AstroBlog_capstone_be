const express = require('express');
const user = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const verifyToken = require('../middlewares/verifyToken')

require('dotenv').config()

const {body, validationResult} = require('express-validator')
const jwt = require("jsonwebtoken");

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

    console.log(userEmail._id)

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

user.patch('/users/:id', async (req, res) => {
    const {id} = req.params

    try {

        const userToUpdate = await userModel.findById(id)

        if (!userToUpdate) {
            res.status(404).send({
                message: 'User not found',
                statusCode: 404
            })
        } else {
            const dataToUpdate = req.body
            const options = {new: true}
            const res = await userModel.findByIdAndUpdate(id, dataToUpdate, options)
            res.status(200).send({
                statusCode: 200,
                message: 'User updated successfully',
                res
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