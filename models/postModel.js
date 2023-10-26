const mongoose = require('mongoose')

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
        instrumentation: {
            telescope: {
                type: String
            },

            camera: {
                type: String
            },
        },

        place: {
            hour: {
                type: Date
            },

            coordinates: {
                latitude: {
                    type: Number
                },

                longitude: {
                    type: Number
                }
            }
        },
        type: Object
    }

}, {
    timestamps: true,
    strict: true
})

module.exports = mongoose.model('postModel', postSchema, 'posts')