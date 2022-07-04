const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const path = require("path");
require('dotenv').config();
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const sauceRoutes = require("./routes/sauce");
const userRoutes = require('./routes/user');

mongoose.connect('mongodb+srv://' + process.env.SECRET_BDD,
  { useNewUrlParser: true,
    useUnifiedTopology: true })
  .then(() => console.log('Connexion à MongoDB réussie !'))
  .catch(() => console.log('Connexion à MongoDB échouée !'));

const app = express();

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // limit each IP to 5 requests per windowMs
});


app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*'); // Permet d'accéder à l'API depuis n'importe quelle origine
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS'); // chaque requête qui peuvent être effectué 
  next();
});


app.use("/images", express.static(path.join(__dirname, "images")));

// app.use("/api/", limiter);
app.use(helmet());
app.use(express.json());

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;