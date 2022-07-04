const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MaskData = require("maskdata");
const passwordValidator = require("password-validator");
const emailValidator = require("email-validator");
require('dotenv').config();

// Je masque l'email pour éviter les intrusions 
const maskEmail2Options = {
maskWidth: "X",
unmaskedStartCharacters: 3, // à partir du 4ème charactère je masque l'email
unmaskedEndCharacters: 20 // je masque jusqu'au 9ème charactère 
};

var passwordSchema = new passwordValidator();

passwordSchema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(1)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

exports.signup = (req, res, next) => {
  if ((!passwordSchema.validate(req.body.password) || !emailValidator.validate(req.body.email))) {
    return res.status(400).json({ message: "Password et/ou email n'a pas le format requis"});
  }
  const maskedEmail = MaskData.maskEmail2(req.body.email, maskEmail2Options);
  // Output: TESTXXXXXXXXXXX:CLIENT-A
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    console.log(req.body.email);
    console.log(process.env.SECRET_HASH_EMAIL_KEY);
    bcrypt.hash(req.body.email, process.env.SECRET_HASH_EMAIL_KEY)
      .then(hashEmail => {
        console.log(hashEmail);
        const user = new User({
            email: maskedEmail,
            hashEmail: hashEmail,
            password: hash
          });
          user.save()
            .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
            .catch(error => res.status(400).json({ error }));
      })
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  // console.log(req.body.email);
  bcrypt.hash(req.body.email, process.env.SECRET_HASH_EMAIL_KEY)
    .then(hashEmail => {
      console.log(hashEmail);
      User.findOne({ hashEmail })
        .then(user => {
          if (!user) {
            return res.status(401).json({ error: 'Utilisateur non trouvé !' });
          }
          bcrypt.compare(req.body.password, user.password) // compare le MDP entrer par l'utilisateur avec le MDP qui est haché et enregistré dans la BDD
            .then(valid => {
              if (!valid) {
                return res.status(401).json({ error: 'Mot de passe et/ou email incorrect !' });
              }
              res.status(200).json({
                userId: user._id,
                token: jwt.sign(
                  { userId: user._id },
                  process.env.SECRET_KEY,
                  { expiresIn: '24h' }
                )
              });
            })
            .catch(error => res.status(500).json({ error }));
        })
        .catch(error => res.status(500).json({ error }));
    })
};