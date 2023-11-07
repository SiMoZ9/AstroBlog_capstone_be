const mongoose = require('mongoose')

const instrumentSchema = new mongoose.Schema({

    telescope: {
        model: {
            type: String
        },

        length: {
            type: Number
        },

        aperture: {
            type: Number
        }
    },

    camera: {
        model: {
            type: String
        },
    }

}, {
    timestamps: true,
    strict: true
})


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

    avatar: {
        type: String,
        default: '/home/simone/Desktop/Capstone project/Capstone_be/assets/2606572_5907.jpg'
    },

    instrumentation: {
        type: instrumentSchema
    }

}, {timestamps: true, strict: true})

module.exports = mongoose.model('userModel', userSchema, 'users')