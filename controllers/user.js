const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const MaskData = require("maskdata");


// Je masque l'email pour éviter les intrusions 
const maskEmail2Options = { 
maskWidth: "X",
unmaskedStartCharacters: 4, // à partir du 4ème charactère je masque l'email
unmaskedEndCharacters: 9 // je masque jusqu'au 9ème charactère 
};



exports.signup = (req, res, next) => {
  const maskedEmail = MaskData.maskEmail2(req.body.email, maskEmail2Options); 
  // Output: TESTXXXXXXXXXXX:CLIENT-A
  bcrypt.hash(req.body.password, 10)
  .then(hash => {
    const user = new User({
        email: maskedEmail,
        password: hash
      });
      user.save()
        .then(() => res.status(201).json({ message: 'Utilisateur créé !' }))
        .catch(error => res.status(400).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};

exports.login = (req, res, next) => {
  User.findOne({ email: req.body.email })
    .then(user => {
      if (!user) {
        return res.status(401).json({ error: 'Utilisateur non trouvé !' });
      }
      bcrypt.compare(req.body.password, user.password) // compare le MDP entrer par l'utilisateur avec le MDP qui est haché et enregistré dans la BDD
        .then(valid => {
          if (!valid) {
            return res.status(401).json({ error: 'Mot de passe incorrect !' });
          }
          res.status(200).json({
            userId: user._id,
            token: jwt.sign(
              { userId: user._id },
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' }
            )
          });
        })
        .catch(error => res.status(500).json({ error }));
    })
    .catch(error => res.status(500).json({ error }));
};
