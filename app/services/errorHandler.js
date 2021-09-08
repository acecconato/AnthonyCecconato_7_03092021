/**
 * Handle errors
 * @param e
 * @param res
 * @return {*}
 */
const Sequelize = require('sequelize');

module.exports = (e, res) => {
  if (e instanceof Sequelize.UniqueConstraintError) {
    return res.status(422).json(e.errors);
  }

  console.error(e);
  return res.status(500).send();
};
