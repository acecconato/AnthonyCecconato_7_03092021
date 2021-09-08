const jwt = require('jsonwebtoken');
const { Users } = require('../models');

/**
 * Login then create a json web token
 * The token can be passed through the Authorization: Bearer header to authenticate a user
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.login = async (req, res) => {
  try {
    const user = await Users.findOne({ where: { username: req.body.username } });

    if (!user || !await user.comparePassword(req.body.password)) {
      return res.status(401).json({ message: 'Bad Credentials' });
    }

    const token = jwt.sign({ uuid: user.uuid, role: user.role }, process.env.SECRET, { expiresIn: 86400 });

    return res.json({
      userId: user.uuid,
      accessToken: token,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};

/**
 * Create a user account
 * @param req
 * @param res
 * @return {Promise<*>}
 */
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

    return res.status(201).json({
      ...user.dataValues, password: undefined, createdAt: undefined, updatedAt: undefined,
    });
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
};
