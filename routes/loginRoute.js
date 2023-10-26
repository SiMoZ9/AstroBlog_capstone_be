const express = require('express');
const login = express.Router()
const bcrypt = require('bcrypt')
const authorModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
const userModel = require("../models/userModel");
require('dotenv').config()

// solo post ovviamente

login.post('/login', async (req, res) => {
    //recupero l'utente
    const user = await authorModel.findOne({ email: req.body.email })

    if (!user) {
        return res.status(404).send({
            statusCode: 404,
            message: 'User not found'
        })
    }

    // controllo la validità della password

    const validPwd = await bcrypt.compare(req.body.password, user.password)

    console.log(validPwd)

    if (!validPwd) {
        return res.status(400).send({
            statusCode: 400,
            message: 'Email or password are incorrect'
        })
    }

    // generazione token
    /*
    * Tutto ciò che voglio che mi ritorni criptato
    * */
    const token = jwt.sign({
        userName: user.userName,
        email: user.email,
        _id: user._id,
    }, process.env.JWT_SECRET, {
        expiresIn: '72h'
    })


    /* TEST */
    const userToken = token.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)
    let id = ""

    const userEmail = await userModel.findById(payload._id)
    if (userEmail) id = payload._id

    console.log(id)

    res.header('Authorization', token).status(200).send({
        message: "Login effettuato con successo",
        statusCode: 200,
        token
    })
})

module.exports = login;