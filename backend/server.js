require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { migrate } = require('./db/database');
const { requireAuth } = require('./middleware/auth');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Stripe webhooks need raw body — mount before json middleware
app.use('/webhooks', require('./routes/webhooks'));

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Auth (no auth guard on login)
app.use('/auth', require('./routes/auth'));

// Protected routes
app.use('/clients', requireAuth, require('./routes/clients'));
app.use('/services', requireAuth, require('./routes/services'));
app.use('/projects', requireAuth, require('./routes/projects'));
app.use('/billing', requireAuth, require('./routes/billing'));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
migrate();
app.listen(PORT, () => console.log(`Prometheus backend running on port ${PORT}`));

module.exports = app;
