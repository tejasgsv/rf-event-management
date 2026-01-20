const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: process.env.PORT || 5000,
  path: '/health',
  method: 'GET'
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', data);
    process.exit(0);
  });
});

req.on('error', err => {
  console.error('Request error:', err.message);
  process.exit(1);
});

req.end();
