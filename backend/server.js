const { MongoClient } = require('mongodb')
const mongoose = require("mongoose");
const express = require('express');
const bcrypt = require('bcrypt');

const app = express();
app.use(express.json());

const MONGOURI = "mongodb+srv://kaiwen129:nopassword321@cluster0.t8zewd0.mongodb.net/?retryWrites=true&w=majority";
const InitiateMongoServer = async () => {
    try {
        await mongoose.connect(MONGOURI, {
            useNewUrlParser: true,
        });
        console.log("Connected to DB !!");
    } catch (e) {
        console.log(e);
        throw e;
    }
}

module.exports = InitiateMongoServer;
