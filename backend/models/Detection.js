const mongoose = require("mongoose");

const detectionSchema = new mongoose.Schema({
    userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
},
    image: {
        type: String,
        required: true
    },

    crop: {
        type: String,
        required: true
    },

    disease: {
        type: String,
        required: true
    },

    confidence: {
        type: Number,
        required: true
    },

    status: {
        type: String,
        required: true
    },

    treatment: {
        type: String,
        required: true
    },

    top_predictions: [
        {
            crop: {
                type: String,
                required: true
            },

            disease: {
                type: String,
                required: true
            },

            confidence: {
                type: Number,
                required: true
            },

            status: {
                type: String,
                required: true
            }
        }
    ],

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("Detection", detectionSchema);
