import React, { useState } from 'react';
import { TextField, Button, Container, Typography, Box, Alert, Paper } from '@mui/material';
import axios from 'axios';

const App = () => {
  const [longUrl, setLongUrl] = useState('');
  const [customShortCode, setCustomShortCode] = useState('');
  const [validity, setValidity] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  const logToServer = async (level, pkg, message) => {
    try {
      await axios.post('http://20.244.56.144/evaluation-service/logs', {
        stack: 'frontend',
        level,
        package: pkg,
        message,
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.REACT_APP_CLIENT_SECRET}`,
        },
      });
    } catch (err) {
      console.error('Frontend logging failed:', err.message);
    }
  };

  const handleShorten = async () => {
    setError('');
    setResult(null);
    setStats(null);

    if (!longUrl) {
      setError('Please enter a valid URL');
      await logToServer('error', 'component', 'Empty URL input');
      return;
    }

    try {
      const response = await axios.post('http://localhost:5000/shorturl5', {
        longUrl,
        customShortCode,
        validityInMinutes: validity ? parseInt(validity) : undefined,
      });

      setResult(response.data);
      await logToServer('info', 'component', `Short URL created: ${response.data.shortLink}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to shorten URL');
      await logToServer('error', 'component', `Error shortening URL: ${err.message}`);
    }
  };

  const handleStats = async () => {
    if (!result?.shortLink) {
      setError('No short URL available to fetch stats');
      await logToServer('error', 'component', 'No short URL for stats');
      return;
    }

    const shortCode = result.shortLink.split('/').pop();

    try {
      const response = await axios.get(`http://localhost:5000/shorturl5/${shortCode}`);
      setStats(response.data);
      await logToServer('info', 'component', `Stats retrieved for shortCode: ${shortCode}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch stats');
      await logToServer('error', 'component', `Error fetching stats: ${err.message}`);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h4" gutterBottom align="center">
          URL Shortener
        </Typography>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            label="Long URL"
            value={longUrl}
            onChange={(e) => setLongUrl(e.target.value)}
            variant="outlined"
            placeholder="https://example.com"
          />
          <TextField
            fullWidth
            label="Custom Shortcode (optional)"
            value={customShortCode}
            onChange={(e) => setCustomShortCode(e.target.value)}
            variant="outlined"
            placeholder="e.g., mylink123"
          />
          <TextField
            fullWidth
            label="Validity (minutes, optional)"
            type="number"
            value={validity}
            onChange={(e) => setValidity(e.target.value)}
            variant="outlined"
            placeholder="Default: 30"
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleShorten}
 pavy     fullWidth
            >
              Shorten URL
            </Button>
            {result && (
              <Button
                variant="outlined"
                color="secondary"
                onClick={handleStats}
                fullWidth
              >
                View Stats
              </Button>
            )}
          </Box>
        </Box>
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
        {result && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Shortened URL</Typography>
            <Typography>
              Short URL: <a href={result.shortLink} target="_blank" rel="noopener noreferrer">{result.shortLink}</a>
            </Typography>
            <Typography>Expires: {new Date(result.expiry).toLocaleString()}</Typography>
          </Box>
        )}
        {stats && (
          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Statistics</Typography>
            <Typography><strong>Original URL:</strong> {stats.longUrl}</Typography>
            <Typography><strong>Total Clicks:</strong> {stats.clicks}</Typography>
            <Typography><strong>Created:</strong> {new Date(stats.createdAt).toLocaleString()}</Typography>
            <Typography><strong>Expires:</strong> {new Date(stats.expiry).toLocaleString()}</Typography>
            <Typography variant="h6" sx={{ mt: 2 }}>Click Data</Typography>
            {stats.clickData.map((click, index) => (
              <Box key={index} sx={{ mb: 1, pl: 2 }}>
                <Typography><strong>Click {index + 1}:</strong> {new Date(click.timestamp).toLocaleString()}</Typography>
                <Typography><strong>Referrer:</strong> {click.referrer}</Typography>
                <Typography><strong>Location:</strong> {click.geo}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default App;