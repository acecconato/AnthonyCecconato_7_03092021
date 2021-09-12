const path = require('path');
const log = require('simple-node-logger').createSimpleLogger(path.join(__dirname, '../../var/logs/errors.log'));

const Sequelize = require('sequelize');

module.exports = (e, res) => {
  if (e instanceof Sequelize.UniqueConstraintError || e instanceof Sequelize.ValidationError) {
    return res.status(422).json(e.errors);
  }

  log.warn({ e });
  console.error(e);
  return res.status(500).send();
};
