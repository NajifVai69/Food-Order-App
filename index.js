const connectDB = require('./db');
const http = require('http');

async function startServer() {
  try {
    await connectDB();
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      res.end('Food Order App server is running and connected to MongoDB!');
    });

    const PORT = process.env.PORT || 3000;
    const HOST = 'localhost';
    server.listen(PORT, HOST, () => {
      console.log(`Server running at http://${HOST}:${PORT}/`);
    });

    server.on('error', (err) => {
      console.error('Server error:', err);
      process.exit(1);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
