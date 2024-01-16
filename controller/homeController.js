const Secret = require('../models/Secret')
const User = require("../models/User");
const sendEmail = require('../utils/sendEmail');
const crypto = require("crypto")


module.exports.home = async (req, res) => {
    try {
        const userId = req.user.id;
        let Usersecrets = await Secret.find({ user: userId }).sort('-createAt').populate({
            path: 'user'
        });
        let otherSecrets = await Secret.find({ category: 'public', user: { $ne: req.user.id } });

        return res.json({
            success: true,
            secrets: Usersecrets,
            otherSecrets
        })

    } catch (error) {
        console.error(error.message);
        res.status(500).send("Internal Server Error");
    }
};

module.exports.createSecrets = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user.noOfSecretLeft === 0) {
            return res.status(400).json({ error: 'No secrets left' });
        }

        const secret = await Secret.create({
            description: req.body.description,
            category: req.body.category,
            user: req.user.id,
        });

        if (req.body.category === 'Public') {
            user.noOfSecretLeft = 0;
            await user.save();
        }

        return res.json({ secret, error: null });
    } catch (err) {
        console.error("Error:", err);
        return res.status(500).send("Internal Server Error");
    }
};

module.exports.deleteSecrets = (req, res) => {
    console.log("Request Query : ", req.query);
    let id = req.query.id;
    console.log("ID : ", id);
  
    Secret.findByIdAndDelete(id, function (err) {
        if (err) {
            console.log('error : ', err)
            return;
        }
    })
    return res.json(200,{message : `Secret having ${id} is deleted`});
}


module.exports.updateSecrets =async (req, res) => {
    try {
        const { edescription, ecategory } = req.body;
        console.log("edesription : ",edescription)
        console.log("ecategory : ",ecategory);
        const newSecret = {}
        if (edescription) { newSecret.edescription = edescription };
        if (ecategory) { newSecret.ecategory = ecategory };

        // Find the secret to be updated and update it
        let secret = await Secret.findById(req.params.id);
        if (!secret) { return res.status(404).send("Not Found") }
        console.log(newSecret)
        secret = await Secret.findByIdAndUpdate(req.params.id, { $set: { description: newSecret.edescription, category: newSecret.ecategory, dueDate: newSecret.edueDate } }, { new: true });
        console.log(secret);
        return res.json({
            secret,
            edescription,
            ecategory,
        });
    } catch (err) {
        console.error(err.message);
        return res.status(500).json({
            "success": false,
            "error" : err.message,
            "Internal Server Error": err
        });
    }
}

// forgot password
exports.forgotPassword = async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
        return res.status(404).json({ message : "User Not Found"});
    }
    const resetToken = user.getResetPasswordToken();

    await user.save({ validateBeforeSave: false });

    const resetPasswordUrl = `http://localhost:5000/user/password/reset/${resetToken}`

    const message = `Your Password Reset Token is : \n\n ${resetPasswordUrl} \n\nIf you have not requested this email then, please ignore it`;

    try {
        await sendEmail({
            email: user.email,
            subject: `Password Recovery Mail`,
            message
        })
        res.status(200).json({
            success: true,
            message: `Email send to ${user.email} successfully`
        })
    } catch (err) {
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        await user.save({ validateBeforeSave: false });

        return res.json({
            "success": false,
            "error": err.message,
        });
    }
}

// Reset Token
exports.resetPassword = async (req, res, next) => {
    // creating token hash as in the database it is saved as hash
    const resetPasswordToken = crypto
        .createHash("sha256").
        update(req.params.token).
        digest("hex");
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        })
        console.log(user)
    if (!user) {
        return res.json({
            "success": true,
            message: "Reset Password Token is Invaid or has been expired"
        });
    }

    if (req.body.password !== req.body.confirmPassword) {
        return res.json({
            "success": false,
            "error": "Password does'nt Match"
        });
    }
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();
    return res.json({
        message: "Password Reset Successfully",
        success : true
    })
}