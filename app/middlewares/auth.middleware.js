const jwt = require('jsonwebtoken');

const { Users } = require('../models');

module.exports = (req, res, next) => {
  if (!req.token) {
    return res.status(403).json('No token provided');
  }

  jwt.verify(req.token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).send({
        message: 'Unauthorized',
      });
    }
    req.userId = decoded.id;
    next();
  });
};
