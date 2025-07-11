const express = require('express');
const axios = require('axios');
const crypto = require('crypto');
const validator = require('validator');
const cors = require('cors');
const dotenv = require('dotenv');
const loggingMiddleware = require('../logging-middleware/middleware');

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;
const urlStore = new Map(); // In-memory storage for URLs

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  req.stack = 'backend';
  req.package = 'middleware';
  loggingMiddleware(req, res, next);
});

// Helper Functions
const generateShortCode = () => {
  return crypto.randomBytes(4).toString('hex').slice(0, 7);
};

const validateUrl = (url) => {
  return validator.isURL(url, { require_protocol: true });
};

const validateShortCode = (code) => {
  return /^[a-zA-Z0-9]{1,10}$/.test(code);
};

const logToServer = async (level, pkg, message) => {
  try {
    await axios.post('http://20.244.56.144/evaluation-service/logs', {
      stack: 'backend',
      level,
      package: pkg,
      message,
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CLIENT_SECRET}`,
      },
    });
  } catch (error) {
    console.error('Logging failed:', error.message);
  }
};

// API Endpoints
app.post('/shorturl5', async (req, res) => {
  const { longUrl, customShortCode, validityInMinutes } = req.body;

  if (!longUrl || !validateUrl(longUrl)) {
    await logToServer('error', 'handler', 'Invalid or missing longUrl');
    return res.status(400).json({ error: 'Invalid or missing longUrl' });
  }

  const expiry = validityInMinutes
    ? new Date(Date.now() + validityInMinutes * 60 * 1000)
    : new Date(Date.now() + 30 * 60 * 1000); // Default 30 minutes

  let shortCode = customShortCode || generateShortCode();

  if (customShortCode && !validateShortCode(customShortCode)) {
    await logToServer('error', 'handler', 'Invalid custom shortcode');
    return res.status(400).json({ error: 'Invalid custom shortcode. Use alphanumeric characters, max length 10.' });
  }

  try {
    if (urlStore.has(shortCode)) {
      await logToServer('error', 'handler', 'Shortcode already in use');
      return res.status(409).json({ error: 'Shortcode already in use' });
    }

    const shortLink = `http://localhost:${port}/${shortCode}`;
    const urlDoc = {
      longUrl,
      shortCode,
      shortLink,
      expiry,
      createdAt: new Date(),
      clicks: [],
    };

    urlStore.set(shortCode, urlDoc);

    await logToServer('info', 'handler', `Short URL created: ${shortLink}`);
    res.status(201).json({ shortLink, expiry: expiry.toISOString() });
  } catch (error) {
    await logToServer('error', 'handler', `Error creating short URL: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/shorturl5/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const urlDoc = urlStore.get(shortCode);

    if (!urlDoc) {
      await logToServer('error', 'handler', 'Short URL not found');
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (urlDoc.expiry < new Date()) {
      await logToServer('error', 'handler', 'Short URL has expired');
      urlStore.delete(shortCode); // Clean up expired URL
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    const clickData = {
      timestamp: new Date(),
      referrer: req.get('Referrer') || 'direct',
      geo: req.get('X-Forwarded-For') ? 'unknown' : 'local', // Simplified geo
    };

    urlDoc.clicks.push(clickData);
    urlStore.set(shortCode, urlDoc);

    await logToServer('info', 'handler', `Stats retrieved for shortCode: ${shortCode}`);
    res.status(200).json({
      longUrl: urlDoc.longUrl,
      clicks: urlDoc.clicks.length,
      createdAt: urlDoc.createdAt,
      expiry: urlDoc.expiry,
      clickData: urlDoc.clicks,
    });
  } catch (error) {
    await logToServer('error', 'handler', `Error retrieving stats: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/:shortCode', async (req, res) => {
  const { shortCode } = req.params;

  try {
    const urlDoc = urlStore.get(shortCode);

    if (!urlDoc) {
      await logToServer('error', 'handler', 'Short URL not found');
      return res.status(404).json({ error: 'Short URL not found' });
    }

    if (urlDoc.expiry < new Date()) {
      await logToServer('error', 'handler', 'Short URL has expired');
      urlStore.delete(shortCode); // Clean up expired URL
      return res.status(410).json({ error: 'Short URL has expired' });
    }

    const clickData = {
      timestamp: new Date(),
      referrer: req.get('Referrer') || 'direct',
      geo: req.get('X-Forwarded-For') ? 'unknown' : 'local',
    };

    urlDoc.clicks.push(clickData);
    urlStore.set(shortCode, urlDoc);

    await logToServer('info', 'handler', `Redirecting for short URL: ${shortCode}`);
    res.redirect(301, urlDoc.longUrl);
  } catch (error) {
    await logToServer('error', 'handler', `Error redirecting: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start Server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});