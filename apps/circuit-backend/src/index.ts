import { createServer } from 'http';
import { WebSocketServer } from 'ws';
import { route, registerRoutes } from './router.js';
import { createDatabaseRequests } from './utils/databaseRequests.js';
import { createRedisRequests } from './utils/redisRequests.js';
import { userLoginRoute, userGetSettingsRoute, userSetSettingsRoute } from './routes/userRoutes.js';
import { log } from './utils/logger.js';
import { createClient } from 'redis';
import { createServices } from './services/index.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8080;

// create server
const server = createServer();
const wss = new WebSocketServer({ server });

const db = createDatabaseRequests(/* pgPool */);

const redisClient = createClient({
  socket: {
    host: '127.0.0.1', // localhost
    port: 6379,        // default Redis/Memurai port
  }
});
await redisClient.connect();
const cache = createRedisRequests(redisClient);

// services
const services = createServices({ db, cache });

// register route modules
registerRoutes([
  ...userLoginRoute(),
  ...userGetSettingsRoute({ settingsService: services.settingsService }),
  ...userSetSettingsRoute({ settingsService: services.settingsService }),
]);

wss.on('connection', (ws) => {
  log('Client connected');

  ws.on('message', (buf) => {
    // don't await the route, its async only for tests
    void route(ws, buf.toString(), { wss });
  });

  ws.on('close', () => log('Client disconnected'));
});

server.listen(PORT, () => log(`WS server listening on :${PORT}`));