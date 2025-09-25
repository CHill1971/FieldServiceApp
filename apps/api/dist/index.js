import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { authRouter } from './routes/auth.js';
import { workordersRouter } from './routes/workorders.js';
import { invoicesRouter } from './routes/invoices.js';
import { techniciansRouter } from './routes/technicians.js';
const app = express();
app.use(cors());
app.use(helmet());
app.use(express.json());
app.get('/health', (_req, res) => {
    res.json({ ok: true, service: 'api', env: process.env.NODE_ENV || 'development' });
});
app.use('/auth', authRouter);
app.use('/workorders', workordersRouter);
app.use('/invoices', invoicesRouter);
app.use('/technicians', techniciansRouter);
const port = Number(process.env.PORT || process.env.API_PORT || 4000);
const server = http.createServer(app);
const io = new SocketIOServer(server, { cors: { origin: '*' } });
io.on('connection', (socket) => {
    socket.emit('hello', { message: 'socket connected' });
});
server.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`API listening on :${port}`);
});
