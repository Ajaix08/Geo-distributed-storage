process.env.SERVICE_NAME = 'gateway';

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const xss = require('xss-clean');
const rateLimit = require('express-rate-limit');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const connectDB = require('./config/db');
const swaggerSpec = require('./docs/swagger');

const requestId = require('../../shared/middleware/requestId');
const errorHandler = require('../../shared/middleware/errorHandler');
const logger = require('../../shared/logger');

const authRoutes = require('./routes/authRoutes');
const fileRoutes = require('./routes/fileRoutes');
const gatewayRoutes = require('./routes/gatewayRoutes');

const { startHealthMonitor } = require('./services/healthCheckService');

const app = express();

app.disable('x-powered-by');
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(xss());
app.use(express.urlencoded({ extended: false, limit: '1mb' }));
app.use(express.json({ limit: '1mb' }));
app.use(requestId);

// Global rate limiting — protects auth & upload endpoints from abuse
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/gateway', gatewayRoutes);

app.get('/health', (req, res) => res.json({ status: 'UP', service: 'gateway' }));

app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));
app.use(errorHandler);

async function start() {
  await connectDB();
  startHealthMonitor();
  app.listen(env.PORT, () => {
    logger.info(`Gateway listening on port ${env.PORT}`);
    logger.info(`Swagger docs available at /api/docs`);
  });
}

start();
