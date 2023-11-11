const express  = require('express');
const post = express.Router();
const postModel = require('../models/postModel')
const userModel = require('../models/userModel')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const multer = require('multer')
const {CloudinaryStorage} = require('multer-storage-cloudinary')


const verifyToken = require('../middlewares/verifyToken')

const {body, validationResult} = require('express-validator')
const mongoose = require("mongoose");

const postValidation = [
    body('title', 'Title cannot be empty').not().isEmpty(),
    body('object', 'Object cannot be empty').not().isEmpty(),
    //body('mainPic', 'You must upload a picture').isEmpty()
]

const cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
async function handleUpload(file) {
    const res = await cloudinary.uploader.upload(file, {
        resource_type: "auto",
    });
    return res;
}


const storage = multer.memoryStorage();
const upload = multer({ storage });
const myUploadMiddleware = upload.single("mainPic");

function runMiddleware(req, res, fn) {
    return new Promise((resolve, reject) => {
        fn(req, res, (result) => {
            if (result instanceof Error) {
                return reject(result);
            }
            return resolve(result);
        });
    });
}



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

post.get('/skyPost/account/posts/:token', verifyToken, async (req, res) => {
    const localToken = req.params.token
    const userToken = localToken.split(' ')[0]
    const payload = jwt.verify(userToken, process.env.JWT_SECRET)

    const id = payload._id
    console.log(id)

    const dbId = new mongoose.Types.ObjectId(id)
    console.log(dbId)

    try {
        const userInfo = await postModel.find({
            author: dbId
        })

        console.log(userInfo)

        if (!userInfo) {
            res.status(404).send({
                statusCode: 404,
                message: "Posts not found"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                userInfo
            })
        }

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
        console.log(e)
    }

})

/*post.post('/skyPost/cloudUpload', cloudUpload.single('mainPic'), async (req, res) => {
    try {
        res.status(200).json({ cover: req.file.path})
    } catch(e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal server error"
        })
        console.log(e)
    }
})*/

post.post('/skyPost/cloudUpload', async (req, res) => {
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

post.patch('/skyPost/edit/:id', verifyToken, async (req, res) => {

    const {id} = req.params

    try {

        const userToUpdate = await postModel.findById(id)

        if (!userToUpdate) {
            res.status(404).send({
                message: 'Post not found',
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

post.delete('/skyPost/delete/:id', async (req, res) => {

    const { id } = req.params;

    try {
        const postToDelete = await postModel.findByIdAndDelete(id)
        if (!postToDelete) {
            return res.status(404).send({
                statusCode: 404,
                message: "Post not found or already deleted!"
            })
        } else {
            res.status(200).send({
                statusCode: 200,
                message: "Post deleted successfully"
            })
        }

    } catch (e) {
        res.status(500).send({
            statusCode: 500,
            message: "Internal Server Error"
        })
    }
})

module.exports = post