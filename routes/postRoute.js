const express  = require('express')
import {body} from 'express-validator'
const postModel = require('../models/postModel')
const userModel = require('../models/userModel')
const verifyToken = require('../middlewares/verifyToken')
const jwt = require('jsonwebtoken')

require('dotenv').config()

const multer = require('multer')
const crypto = require('crypto')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')


const post = express.Router()

export const postValidation = [
    body('title', 'Title cannot be empty').not().isEmpty(),
    body('object', 'Object cannot be empty').not().isEmpty(),
    body('mainPic', 'You must upload a picture').isEmpty()
]

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_NAME
})

const cloudStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'Astro_pic',
        format: async (req, res) => 'png',
        public_id: (req, file) => file.name
    }
})

const cloudUpload = multer({storage: cloudStorage})

post.get('/skyPost', verifyToken, async (req, res) => {

    const {
        page = 1,
        pageSize = 10
    } = req.query

    try {
        const posts = await postModel.find().limit(pageSize).skip((page - 1) * (pageSize)).populate('author')
        res.status(200).send({
            statusCode: 500,
            currentPage: Number(page),
            posts
        })

    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }
})

post.post('/skyPost/cloudUpload', cloudUpload.single('cover'), async (req, res) => {
    try {
        res.status(200).json({ cover: req.file.path})
    } catch(e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
        console.log(e)
    }
})

post.post('/skyPost', postValidation, async (req, res) => {

    const localToken = JSON.parse(localStorage.getItem('loggedInUser'))
    const userToken = localToken.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)

    const userEmail = await userModel.findOne({email: payload.email})
    const {_id} = userEmail

    const newPost = new postModel({
        author: _id,
        object: req.body.object,
        title: req.body.title,

        mainPic: req.body.mainPic,

        description: {
            instrumentation: {
                telescope: req.body.description.instrumentation.telescope,
                camera: req.body.description.instrumentation.camera
            },

            place: {
                hour: req.body.description.place.hour,
                coordinates: {
                    latitude: req.body.description.place.coordinates.latitude,
                    longitude: req.body.description.place.coordinates.longitude
                }
            }
        }
    })

    try {

        const postSave = await newPost.save()

        res.status(201).send({
            statusCode: 201,
            message: 'Post published successfully',
            postSave
        })
    } catch (err) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
    }

})

module.exports = post