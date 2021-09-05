// Load vendor dependencies
const bodyParser = require('body-parser');
const express = require('express');
const morgan = require('morgan');
const bearerToken = require('express-bearer-token');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const helmet = require('helmet');
const fs = require('fs');
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

const {
  sequelize, Users, Posts, Comments, UsersReports,
} = require('./app/models');

// Load .env configuration
require('dotenv').config();

// Define variables
const HOST = process.env.APP_HOST || '0.0.0.0';
const PORT = process.env.APP_PORT || 3000;

// Load express
const app = express();

// Load documentation
const swaggerDocument = YAML.load('./docs/swagger.yaml');
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Helmet for default security
app.use(helmet());

// Serve static files
app.use(process.env.PUBLIC_DIR, express.static('public'));

// Define baseDir global variable
app.use((req, res, next) => {
  process.env.baseDir = `${req.protocol}://${req.headers.host}`;
  process.env.apiBaseDir = `${process.env.baseDir}${process.env.API_URL}`;
  next();
});

// Load CORS
app.use(cors({
  origin: process.env.CLIENT_ENDPOINT,
}));

// Output and log HTTP requests
if (process.env.NODE_ENV === 'production') {
  app.use(morgan('combined', {
    stream: fs.createWriteStream(path.join(__dirname, 'var/logs/access.log'), { flags: 'a' }),
  }));
} else if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Get request body's parameters
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Load files from requests
app.use(fileUpload({
  limits: { fileSize: 1e+6 }, // 1MB
  safeFileNames: true,
  abortOnLimit: true,
}));

// Create a req.token key if a Bearer token is detected
app.use(bearerToken());

// Load all routes
app.use(process.env.API_URL, require('./app/routes'));

app.post('/users', async (req, res) => {
  const { email, password, username } = req.body;
  const { firstName, lastName, birthdate } = req.body || null;

  try {
    const user = await Users.create({
      email, password, username, firstName, lastName, birthdate,
    });
    return res.status(201).json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).json(e.errors);
  }
});

app.get('/users', async (req, res) => {
  try {
    const users = await Users.findAll({ include: ['reportedUsers', 'reports'] });
    return res.json(users || []);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.get('/users/:uuid', async (req, res, next) => {
  if (!req.params.uuid) {
    return next();
  }

  const { uuid } = req.params;

  try {
    const user = await Users.findOne({ where: { uuid } });

    if (!user) {
      return res.status(404).json('User not found');
    }

    user.setDataValue('posts', await user.getPosts());

    return res.json({ user });
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.post('/users/:uuid/report', async (req, res, next) => {
  if (!req.params.uuid) {
    return next();
  }

  const { uuid } = req.params;
  const { fromUserUUID } = req.body;

  try {
    const userToReport = await Users.findOne({ where: { uuid } });
    const fromUser = await Users.findOne({ where: { uuid: fromUserUUID } });

    const report = await UsersReports.create({ fromUserId: fromUser.id, reportedUserId: userToReport.id });

    return res.json({ report });
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.put('/users/:uuid', async (req, res, next) => {
  if (!req.params.uuid) {
    return next();
  }

  const { uuid } = req.params;
  const { name, email, role } = req.body;

  try {
    const user = await Users.findOne({ where: { uuid } });

    if (!user) {
      return res.status(404).json('User not found');
    }

    user.name = name;
    user.email = email;
    user.role = role;

    await user.save();

    return res.json(user);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.delete('/users/:uuid', async (req, res, next) => {
  if (!req.params.uuid) {
    return next();
  }

  const { uuid } = req.params;

  try {
    const user = await Users.findOne({ where: { uuid } });

    if (!user) {
      return res.status(404).json('User not found');
    }

    await user.destroy();

    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
});

app.delete('/posts/:uuid', async (req, res, next) => {
  if (!req.params.uuid) {
    return next();
  }

  const { uuid } = req.params;

  try {
    const post = await Posts.findOne({ where: { uuid } });

    if (!post) {
      return res.status(404).json('Post not found');
    }

    await post.destroy();

    return res.status(204).send();
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
});

app.post('/posts', async (req, res) => {
  const { userUUID, content } = req.body;

  try {
    const user = await Users.findOne({ where: { uuid: userUUID } });
    const post = await Posts.create({ content, userId: user.id });

    return res.status(201).json(post);
  } catch (e) {
    console.error(e);
    return res.status(500).json(e.errors);
  }
});

app.get('/posts', async (req, res) => {
  try {
    const posts = await Posts.findAll({ include: ['user', 'comments'] });
    return res.json(posts || []);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.get('/comments', async (req, res) => {
  try {
    const comments = await Comments.findAll({ include: ['user', 'post'] });
    return res.json(comments || []);
  } catch (e) {
    console.error(e);
    return res.status(500).send();
  }
});

app.post('/comments', async (req, res) => {
  const { userUUID, postUUID, content } = req.body;

  try {
    const user = await Users.findOne({ where: { uuid: userUUID } });
    const post = await Posts.findOne({ where: { uuid: postUUID } });

    const comment = await Comments.create({ content, postId: post.id, userId: user.id });

    return res.status(201).json(comment);
  } catch (e) {
    console.error(e);
    return res.status(500).json(e);
  }
});

// Returns a 404 response for all unregistered routes
app.all('*', (req, res) => {
  res.status(404).json('Resource not found');
});

app.listen(PORT, HOST, async () => {
  try {
    console.log(`Server up on ${HOST}:${PORT}`);
    await sequelize.authenticate();
    console.log('Database connected');
  } catch (e) {
    console.error(e);
  }
});
