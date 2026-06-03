require('dotenv').config();
const path = require('path');
const express = require('express');
const cors = require('cors');
const { migrate } = require('./db/database');
const { requireAdmin, requireClient } = require('./middleware/auth');
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

// Admin-only management routes
app.use('/clients', requireAdmin, require('./routes/clients'));
app.use('/services', requireAdmin, require('./routes/services'));
app.use('/projects', requireAdmin, require('./routes/projects'));
app.use('/billing', requireAdmin, require('./routes/billing'));
app.use('/quotes', requireAdmin, require('./routes/quotes'));

// Client-portal routes (scoped to the logged-in client)
app.use('/portal', requireClient, require('./routes/portal'));

// Frontend: login page, admin dashboard and client portal are static files
// served from the same origin as the API (so no CORS dance for the SPA).
app.use('/app', express.static(path.join(__dirname, 'public')));

app.use(errorHandler);

const PORT = process.env.PORT || 3001;
migrate();
app.listen(PORT, () => console.log(`Prometheus backend running on port ${PORT}`));

module.exports = app;
