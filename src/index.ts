import express from 'express';
import dotenv from 'dotenv';
import { createServer } from 'http';
dotenv.config();
import createRoutes from './core/routes.js';
import {SocServer} from './core/socket.js';
import './core/db.js';

const app = express();
const http = createServer(app);
const io = SocServer(http);

createRoutes(app, io);

const PORT: number = process.env.PORT ? Number(process.env.PORT) : 3000;

http.listen(PORT, function () {
  console.log(`Server: http://localhost:${PORT}`);
});
