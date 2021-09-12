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
const log = require('simple-node-logger').createSimpleLogger(('var/logs/errors.log'));

// Load .env configuration
require('dotenv').config();

const { sequelize } = require('./app/models');

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
    log.error({ e });
    console.error(e);
  }
});
