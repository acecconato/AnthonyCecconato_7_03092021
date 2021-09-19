const { Parser } = require('json2csv');

const { Users } = require('../models');

/**
 * Export user datas
 * @param req
 * @param res
 * @return {Promise<*>}
 */
exports.exportMyData = async (req, res) => {
  const user = await Users.findOne({
    where: { id: req.user.id },
    attributes: { exclude: ['password'] },
    include: ['comments', 'posts'],
  });

  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const json2csv = new Parser();
  const csv = json2csv.parse(user.dataValues);

  const filename = `${user.id}_${(new Date().toJSON().slice(0, 10))}.csv`;

  res.header('Content-Type', 'text/csv');
  res.attachment(filename);

  return res.send(csv);
};
