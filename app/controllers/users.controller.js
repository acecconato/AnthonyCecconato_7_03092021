// public
exports.getAllUsers = (req, res) => {
  console.log('ok');
  return res.status(200).send('Public Content.');
};

// logged in && user role
exports.getUserByUUID = (req, res) => {
  res.status(200).send('User Content.');
};

// admin only
exports.deleteUser = (req, res) => {
  res.status(200).send('Admin Content.');
};

exports.updateUser = (req, res) => {

};

exports.updateUserPassword = (req, res) => {

};

exports.reportUser = (req, res) => {

};
