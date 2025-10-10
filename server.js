const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = dev ? 'localhost' : '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.io
  const io = new Server(server, {
    cors: {
      origin: dev ? ["http://localhost:3000"] : [],
      methods: ["GET", "POST"],
      credentials: true
    }
  });

  // Socket.io connection handling
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    socket.on('join-dashboard', () => {
      socket.join('dashboard');
      console.log('Client joined dashboard:', socket.id);
      
      // Emit updated user count to all clients in dashboard
      const dashboardSockets = io.sockets.adapter.rooms.get('dashboard');
      const userCount = dashboardSockets ? dashboardSockets.size : 0;
      io.to('dashboard').emit('user-count-update', userCount);
    });

    socket.on('leave-dashboard', () => {
      socket.leave('dashboard');
      console.log('Client left dashboard:', socket.id);
      
      // Emit updated user count to all clients in dashboard
      const dashboardSockets = io.sockets.adapter.rooms.get('dashboard');
      const userCount = dashboardSockets ? dashboardSockets.size : 0;
      io.to('dashboard').emit('user-count-update', userCount);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      
      // Emit updated user count to all remaining clients in dashboard
      setTimeout(() => {
        const dashboardSockets = io.sockets.adapter.rooms.get('dashboard');
        const userCount = dashboardSockets ? dashboardSockets.size : 0;
        io.to('dashboard').emit('user-count-update', userCount);
      }, 100); // Small delay to ensure socket is fully disconnected
    });
  });

  // Make io accessible to API routes
  server.io = io;

  server
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
      console.log('> Socket.io server is running');
    });
});