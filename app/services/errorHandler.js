const path = require('path');
const log = require('simple-node-logger').createSimpleLogger(path.join(__dirname, '../../var/logs/errors.log'));

const Sequelize = require('sequelize');

module.exports = (e, res) => {
  if (e instanceof Sequelize.UniqueConstraintError || e instanceof Sequelize.ValidationError) {
    const errors = [];
    e.errors.forEach((error) => {
      errors.push({ type: error.type, message: error.message, field: error.path });
    });

    return res.status(422).json(errors || e.errors);
  }

  log.warn({ e });
  console.error(e);
  return res.status(500).send();
};
