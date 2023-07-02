const axios = require('axios');
const express = require('express');
const bodyParser = require("body-parser");
const port = process.env.port || 4000;
const jwt = require("jsonwebtoken");
const mongoose = require('mongoose');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const auth = require("./auth.js");
const genRandPass = require("./genRandPass.js");
const dotenv = require('dotenv');
dotenv.config();

const InitiateMongoServer = require("./server.js");
InitiateMongoServer();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const SECRET_KEY = "randomString";

const userSchema = new mongoose.Schema({
  userID: String,
  username: String,
  email: String,
  password: String,
  likeCount: {type: Number, default: 0},
  joinDate: {type: Date, default: Date.now}
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.json({message: "API working"})
});

app.post('/api/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check username length
    if (username.length < 6) {
      return res.status(400).json({ message: 'Username must have a minimum length of 6 characters' });
    }

    // Check password length
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must have a minimum length of 6 characters' });
    }

    // Check email validity
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address' });
    }

    // Check if the email already exists
    const existingEmail = await User.findOne({ email, });
    if (existingEmail) {
      return res.status(409).json({ message: `Email ${email} already exists` });
    }

    // Check if the user already exists
    const existingUser = await User.findOne({ username, });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Create a new user
    const newUserID = uuidv4();
    const user = new User({ userID: newUserID, username, email, password, });
    await user.save();

    res.status(201).json({ message: 'Registration successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    // Check if the user doesn't exist
    const existingUser = await User.findOne({ username, });
    if (!existingUser) {
      return res.status(404).json({ message: 'Username does not exist.' });
    }

    const matchingLogin = await User.findOne({ username, password });
    if (!matchingLogin) {
      return res.status(401).json({ message: 'Incorrect password.' });
    }

    const user_id = matchingLogin.userID

    const payload = {
      user_id
    };

    jwt.sign(
      payload,
      SECRET_KEY,
      {
        expiresIn: '1h',
      },
      (err, token) => {
        if (err) throw err;
        res.status(200).json({
          token,
        });
      }
    );

    //res.status(201).json({ message: 'Login successful' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.get('/stats', auth, async (req, res) => {
  console.log(req.userID.user_id);
  try {
    const user = await User.findOne({userID: req.userID.user_id});
    res.json(user);
  } catch (e) {
    res.send({ message: req.userID });
  }
});

app.put('/like', auth, async (req, res) => {
  console.log(req.userID.user_id);
  try {
    User.findOneAndUpdate(
      { userID: req.userID.user_id },
      { $inc: { likeCount: 1 } },
    )
      .then(res => {
        console.log('Incremented likes');
      })
      .catch(e => {
        console.error(e);
      });
    res.status(201).json({ message: 'inc successful' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/dislike', auth, async (req, res) => {
  console.log(req.userID.user_id);
  try {
    User.findOneAndUpdate(
      { userID: req.userID.user_id },
      { $inc: { likeCount: -1 } },
    )
      .then(res => {
        console.log('Decremented likes');
      })
      .catch(e => {
        console.error(e);
      });
    res.status(201).json({ message: 'dec successful' });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.post('/api/google_login', async (req, res) => {
  const { email } = req.body;
  console.log(req.body);
  // Check if the email already exists
  const matchingLogin = await User.findOne({ email, });

  if (matchingLogin) {
    try {
      const user_id = matchingLogin.userID

      const payload = {
        user_id
      };

      jwt.sign(
        payload,
        SECRET_KEY,
        {
          expiresIn: '1h',
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
      //res.status(201).json({ message: 'Login successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    try {
      // Create a new user
      const newUsername = email.substring(0, email.indexOf('@'));

      const randPassword = genRandPass();

      const newUserID = uuidv4();

      const user = new User({ userID: newUserID, username: newUsername, email: email, password: randPassword, });
      await user.save();
      
      
      // login 
      const matchingLogin = await User.findOne({ email, });

      const user_id = matchingLogin.userID

      const payload = {
        user_id
      };

      jwt.sign(
        payload,
        SECRET_KEY,
        {
          expiresIn: '1h',
        },
        (err, token) => {
          if (err) throw err;
          res.status(200).json({
            token,
          });
        }
      );
      //res.status(201).json({ message: 'Login successful' });


      res.status(201).json({ message: 'Registration successful' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
});

app.listen(process.env.API_PORT);

module.exports = app;

