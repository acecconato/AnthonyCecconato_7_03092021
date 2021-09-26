const faker = require('faker');
const argon2 = require('argon2');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const password = await argon2.hash('aStrongPassword@0');
    const usersIds = [...Array(10)].map((id) => ({ id: faker.datatype.uuid() }));

    const users = [];
    const feeds = [];

    usersIds.forEach((user, i) => {
      users.push({
        id: user.id,
        email: `demo${i}@demo.fr`,
        password,
        username: `Demo${i}`,
        role: 'user',
        createdAt: faker.date.recent(),
        updatedAt: faker.date.recent(),
      });

      feeds.push({
        id: faker.datatype.uuid(),
        userId: user.id,
      });
    });

    // Create demo admin
    const adminId = faker.datatype.uuid();
    users.push({
      id: adminId,
      email: 'admin@demo.fr',
      password,
      username: 'Admin',
      role: 'admin',
      createdAt: faker.date.recent(),
      updatedAt: faker.date.recent(),
    });

    feeds.push({
      id: faker.datatype.uuid(),
      userId: adminId,
    });

    await queryInterface.bulkInsert('Users', users);
    await queryInterface.bulkInsert('Feeds', feeds);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('Users', null);
  },
};
