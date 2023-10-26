const mongoose = require('mongoose')

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

    instrumentation: [{
        type: [instrumentSchema]
    }]

}, {timestamps: true, strict: true})


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

        filters: {
            type: Array
        }
    }

}, {
    timestamps: true,
    strict: true
})

module.exports = mongoose.model('userModel', userSchema, 'users')