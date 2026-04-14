'use strict';

const express = require('express');
const { google } = require('googleapis');

const app = express();
app.use(express.json());

// Prevent caching on API responses
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store');
  next();
});

function getCalendarClient() {
  const raw = process.env.GOOGLE_SERVICE_ACCOUNT_CREDENTIALS;
  if (!raw) throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS env var is not set');

  let credentials;
  try {
    credentials = JSON.parse(raw);
  } catch {
    throw new Error('GOOGLE_SERVICE_ACCOUNT_CREDENTIALS must be valid JSON');
  }

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ['https://www.googleapis.com/auth/calendar'],
  });
  return google.calendar({ version: 'v3', auth });
}

// POST /api/schedule
// Body: { name, email, company?, date (YYYY-MM-DD), time (HH:MM), message? }
app.post('/api/schedule', async (req, res) => {
  const { name, email, company, date, time, message } = req.body || {};

  // Validate required fields
  if (!name || !email || !date || !time) {
    return res.status(400).json({ error: 'name, email, date, and time are required' });
  }

  // Basic email sanity check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address' });
  }

  // Validate date format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return res.status(400).json({ error: 'date must be in YYYY-MM-DD format' });
  }

  // Validate time format
  if (!/^\d{2}:\d{2}$/.test(time)) {
    return res.status(400).json({ error: 'time must be in HH:MM format' });
  }

  // Reject dates in the past
  const startDateTime = new Date(`${date}T${time}:00Z`);
  if (isNaN(startDateTime.getTime())) {
    return res.status(400).json({ error: 'Invalid date or time value' });
  }
  if (startDateTime < new Date()) {
    return res.status(400).json({ error: 'Cannot schedule a call in the past' });
  }

  const endDateTime = new Date(startDateTime.getTime() + 90 * 60 * 1000); // 90-minute call

  const calendarOwner = process.env.CALENDAR_OWNER_EMAIL || 'engage@prometheus-ai.com';

  const eventTitle = `Prometheus Diagnostic Call — ${name}${company ? ` (${company})` : ''}`;
  const eventDescription = [
    `Free 90-minute AI diagnostic call with ${name}${company ? ` from ${company}` : ''}.`,
    '',
    message ? `Client note: ${message}` : '',
    '',
    `Contact: ${email}`,
    '',
    'Automatically scheduled via prometheus-ai.com',
  ].join('\n').replace(/\n{3,}/g, '\n\n').trim();

  try {
    const calendar = getCalendarClient();

    const event = {
      summary: eventTitle,
      description: eventDescription,
      start: { dateTime: startDateTime.toISOString(), timeZone: 'UTC' },
      end:   { dateTime: endDateTime.toISOString(),   timeZone: 'UTC' },
      attendees: [
        { email, displayName: name },
        { email: calendarOwner, displayName: 'Prometheus AI' },
      ],
      conferenceData: {
        createRequest: {
          requestId: `prometheus-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          conferenceSolutionKey: { type: 'hangoutsMeet' },
        },
      },
    };

    const response = await calendar.events.insert({
      calendarId: process.env.GOOGLE_CALENDAR_ID || 'primary',
      resource: event,
      conferenceDataVersion: 1,
      sendUpdates: 'all', // Google Calendar sends email invites to all attendees
    });

    const meetLink = response.data.conferenceData?.entryPoints?.find(
      ep => ep.entryPointType === 'video'
    )?.uri || null;

    res.json({
      success: true,
      meetLink,
      eventLink: response.data.htmlLink,
      summary: response.data.summary,
      start: response.data.start?.dateTime,
    });
  } catch (err) {
    console.error('[scheduler] Error creating calendar event:', err.message);
    res.status(500).json({
      error: 'Failed to create meeting. Please try again or email engage@prometheus-ai.com directly.',
    });
  }
});

// Health check
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

const PORT = Number(process.env.SCHEDULER_PORT) || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`[scheduler] Prometheus scheduler listening on port ${PORT}`);
});
