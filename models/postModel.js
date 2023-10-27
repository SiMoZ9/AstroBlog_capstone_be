const mongoose = require('mongoose')

const instrumentationSchema = new mongoose.Schema({
    telescope: {
        type: String
    },

    camera: {
        type: String
    }
}, {
    timestamps: true,
    strict: true
})

const placeSchema = new mongoose.Schema({
    coordinates: {
        latitude: {
            type: Number
        },

        longitude: {
            type: Number
        }
    }
}, {
    timestamps: true,
    strict: true
})

const descriptionSchema = new mongoose.Schema({

    instrumentation: {
        type: instrumentationSchema
    },

    place:{
        type: placeSchema
    }
}, {
    timestamps: true,
    strict: true
})

const postSchema = new mongoose.Schema({

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "userModel"
    },

    object: {
        type: String,
        required: true
    },

    title: {
        type: String,
        required: true
    },

    mainPic: {
        type: String
    },

    description: {
        type: descriptionSchema
    }

}, {
    timestamps: true,
    strict: true
})

module.exports = mongoose.model('postModel', postSchema, 'posts')