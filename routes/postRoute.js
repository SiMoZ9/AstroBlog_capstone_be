const express  = require('express');
const post = express.Router();
const postModel = require('../models/postModel')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const multer = require('multer')
const cloudinary = require('cloudinary').v2
const {CloudinaryStorage} = require('multer-storage-cloudinary')

const verifyToken = require('../middlewares/verifyToken')

const {body, validationResult} = require('express-validator')

const postValidation = [
    body('title', 'Title cannot be empty').not().isEmpty(),
    body('object', 'Object cannot be empty').not().isEmpty(),
    //body('mainPic', 'You must upload a picture').isEmpty()
]

cloudinary.config({
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
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

post.get('/skyPost/all', verifyToken, async (req, res) => {

    const {
        page = 1,
        pageSize = 10
    } = req.query

    try {
        const posts = await postModel.find().limit(pageSize).skip((page - 1) * (pageSize)).populate('author')
        res.status(200).send({
            statusCode: 200,
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

post.get('/skyPost/:id', verifyToken, async (req, res) => {

    const {id} = req.params
    console.log(id)
    try {
        const thisPost = await postModel.findById(id).populate('author')
        if (!thisPost) {
            res.status(404).send({
                statusCode: 404,
                message: "Post not exist"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                thisPost
            })
        }
    } catch (e) {

    }
})

post.post('/skyPost/cloudUpload', cloudUpload.single('mainPic'), async (req, res) => {
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

post.post('/skyPost/post/:token', postValidation, verifyToken, async (req, res) => {

    const localToken = req.params.token
    const userToken = localToken.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)

    let id = ""
    const userEmail = await userModel.findById(payload._id)
    if (userEmail) id = payload._id

    const newPost = new postModel({
        author: id,
        object: req.body.object,
        title: req.body.title,

        mainPic: req.body.mainPic,
        description: req.body.description
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