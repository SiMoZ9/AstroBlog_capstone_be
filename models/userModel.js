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
        type: String
    },

    cameras: {
        type: String
    },

    narrowband: {
        type: String
    },

    broadband: {
        type: String
    },

    mounts: {
        type: String
    },

    guides: {
        type: String
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
    },

    header: {
        type: String,
    },

}, {timestamps: true, strict: true})

module.exports = mongoose.model('userModel', userSchema, 'users')