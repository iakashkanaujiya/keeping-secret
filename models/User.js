const mongoose = require('mongoose');
const { Schema } = mongoose;
const crypto = require("crypto")
const bcrypt = require("bcryptjs");

const UserSchema = new Schema({
    name: {
        type: String,
        required : true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    noOfSecretLeft: {
        type: Number,
        default: 1,
        max: 1,
        min : 0
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
}, {
    timestamps : true
})

UserSchema.methods.getResetPasswordToken = function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 20 * 60 * 1000;
    return resetToken;
};

// UserSchema.pre("save", async function (next) {
//     if (!this.isModified("password")) {
//         next();
//     }
//     const salt = await bcrypt.genSalt(10);
//     this.password = await bcrypt.hash(this.password, salt);
// });

const User = mongoose.model('User',UserSchema)
module.exports = User;