const express = require('express');
const user = express.Router()
const userModel = require('../models/userModel')
const bcrypt = require('bcrypt')

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

user.post('/users/create', async (req, res) => {

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