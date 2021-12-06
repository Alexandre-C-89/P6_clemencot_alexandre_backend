const rateLimter = require("express-rate-limit");

// je fais attention à la force du mot de passe
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 100 requests per windowMS
  message:
    "Trop de compte créer à partir de cette adresse IP"
});