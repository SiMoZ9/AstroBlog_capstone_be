const mongoose = require('mongoose')

const instrumentationSchema = new mongoose.Schema({
    telescope: {
        type: String
    },

    camera: {
        type: String
    },

    filters: {
        broadband: {
            l: {
                type: String
            },
            r: {
                type: String
            },
            g: {
                type: String
            },
            b: {
                type: String
            },
        },
        narrowband: {
            ha: {
                type: String
            },
            oiii: {
                type: String
            },
            sii: {
                type: String
            },
        },

        color: {
            enanched: {
                type: String
            },
        }
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
        },

        ra: {
            type: Number
        },

        dec: {
            type: Number
        },

        date: {
            type: String
        }
    },

    constellation: {
        type: String
    }
}, {
    timestamps: true,
    strict: true
})


const descriptionSchema = new mongoose.Schema({

    text: {
        type: String
    },

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
        type: String,
        required: true
    },

    description: {
        type: descriptionSchema
    }

}, {
    timestamps: true,
    strict: true
})

module.exports = mongoose.model('postModel', postSchema, 'posts')