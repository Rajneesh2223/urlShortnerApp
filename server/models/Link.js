const mongoose = require('mongoose');

const linkSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    originalUrl: {
        type: String,
        required: true,
    },
    clicks: {
        type: Number,
        default: 0,
    },
    lastClickedAt: {
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Link', linkSchema);
