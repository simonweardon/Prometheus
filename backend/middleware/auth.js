const jwt = require('jsonwebtoken');

// Verifies the bearer token and attaches the decoded payload to req.user.
// Tokens carry a `role` of either 'admin' (staff) or 'client' (portal user).
// Tokens issued before roles existed are treated as admin for compatibility.
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid authorization header' });
  }
  const token = header.slice(7);
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// Admin-only guard (staff dashboard + management endpoints).
function requireAdmin(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  });
}

// Client-portal guard. Ensures the caller is a logged-in client and exposes
// req.clientId for convenient, tamper-proof scoping of portal queries.
function requireClient(req, res, next) {
  requireAuth(req, res, () => {
    if (req.user.role !== 'client' || !req.user.clientId) {
      return res.status(403).json({ error: 'Client access required' });
    }
    req.clientId = req.user.clientId;
    next();
  });
}

module.exports = { requireAuth, requireAdmin, requireClient };
