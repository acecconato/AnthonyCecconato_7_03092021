const jwt = require('jsonwebtoken');
const { Users } = require('../models');

exports.login = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { username: req.body.username } });

    console.log(user.id);

    if (!user || !await user.comparePassword(req.body.password)) {
      return res.status(401).json('Bad Credentials');
    }

    const token = jwt.sign({ id: user.id }, process.env.SECRET, { expiresIn: 86400 });

    return res.json({
      // userId: user.get('id'),
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};

exports.signup = async (req, res) => {
  try {
    const user = await Users.create(req.body, {
      fields: [
        'email',
        'password',
        'username',
        'firstName',
        'lastName',
        'birthdate',
      ],
    });

    return res.status(201).json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};
