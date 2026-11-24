/**
 * server.js (Root Unified Server)
 * -----------------------------------------------------------------------------
 * Khởi chạy máy chủ hợp nhất: phục vụ Web tĩnh & Real-time Socket.io Multiplayer
 * -----------------------------------------------------------------------------
 */

import { OnigiriServer, SERVER_CONFIG } from './server/server.js';

const PORT = process.env.PORT || SERVER_CONFIG.PORT;
const server = new OnigiriServer(PORT, SERVER_CONFIG.HOST || '0.0.0.0');

server.start().then(() => {
    console.log(`🍙 Onigiri Empire 2D running at http://${SERVER_CONFIG.HOST || '0.0.0.0'}:${PORT}/`);
}).catch((err) => {
    console.error('Failed to start server:', err);
});
