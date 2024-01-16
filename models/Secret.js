const mongoose = require('mongoose');
const { Schema } = mongoose;

const SecretSchema = new Schema({
    description: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
})

const Secret = mongoose.model("SecretList", SecretSchema)
module.exports = Secret;