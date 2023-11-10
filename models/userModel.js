const mongoose = require('mongoose')

const socialSchema = new mongoose.Schema({
    facebook: {
        type: String
    },

    x: {
        type: String
    },

    ig: {
        type: String
    }
}, {
    timestamps: true,
    strict: true
})

const instrumentSchema = new mongoose.Schema({
    telescopes: {
        type: Array
    },

    cameras: {
        type: Array
    },

    narrowband: {
        type: Array
    },

    broadband: {
        type: Array
    },

    mounts: {
        type: Array
    },

    guides: {
        type: Array
    }

}, {timestamps: true, strict: true})

const userSchema = new mongoose.Schema({

    userName: {
        type: String,
        required: true
    },

    firstName: {
        type: String
    },

    lastName: {
        type: String
    },

    email: {
        type: String,
        require: true
    },

    password: {
        type: String,
        required: true,
        min: 8
    },

    birth: {
        type: Date
    },

    socials: {
        type: socialSchema
    },

    instruments: {
        type: instrumentSchema
    },

    avatar: {
        type: String,
        default: '/home/simone/Desktop/Capstone project/Capstone_be/assets/2606572_5907.jpg'
    },

    posts: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'postModel'
    }

}, {timestamps: true, strict: true})

module.exports = mongoose.model('userModel', userSchema, 'users')