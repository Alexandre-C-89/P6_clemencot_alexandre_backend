const jwt = require('jsonwebtoken');
const MaskData = require("maskdata");

module.exports = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(' ')[1];
    const decodedToken = jwt.verify(token, 'RANDOM_TOKEN_SECRET');
    const userId = decodedToken.userId;
    if (req.body.userId && req.body.userId !== userId) {
      throw 'Invalid user ID';
    } else {
      next();
    }
  } catch {
    res.status(401).json({
      error: new Error('Invalid request!')
    });
  }
};

const maskPasswordOptions = {
maskWidth: "X",
maxMaskedCharacters: 20, // To limit the output String length to 20.
unmaskedStartCharacters: 4,
unmaskedEndCharacters: 9
};

const password = "TEST:U2VjcmV0S2V5MQ==:CLIENT-A";

const maskedPassword = MaskData.maskPassword(password, maskPasswordOptions); //Output: TESTXXXXXXXXXXX:CLIENT-A

maskPasswordOptions.unmaskedStartCharacters = 0;