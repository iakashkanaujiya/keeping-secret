const mongoose = require('mongoose');
require("dotenv").config({path: "config/config.env"})

const DB_URL = process.env.DB_URL;

mongoose.connect(DB_URL, {
    dbName: "keepingsecret",
})

const db = mongoose.connection;

db.on('error', console.error.bind(console,"Error Connecting to Mongodb"))
db.once('open', function () {
    console.log("Connected to Mongodb successfully");
})

module.exports = db;