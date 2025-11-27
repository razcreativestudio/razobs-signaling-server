const WebSocket = require('ws');

/**
 * RAZ OBS Tools - WebSocket Signaling Server
 * Enables cross-network P2P connections
 */

const PORT = parseInt(process.env.PORT) || 8080;
const server = new WebSocket.Server({ port: PORT });

// Room management: roomId -> Set of WebSocket clients
const rooms = new Map();

// Client tracking: ws -> { roomId, clientId }
const clients = new WeakMap();

console.log(`🚀 RAZ OBS Signaling Server running on port ${PORT}`);

server.on('connection', (ws, req) => {
    const clientId = generateId();
    const clientIp = req.socket.remoteAddress;
    
    console.log(`✅ Client connected: ${clientId} from ${clientIp}`);
    
    // Send welcome message
    ws.send(JSON.stringify({
        type: 'welcome',
        clientId: clientId,
        timestamp: Date.now()
    }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message);
            handleMessage(ws, data, clientId);
        } catch (error) {
            console.error('❌ Invalid message:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Invalid JSON'
            }));
        }
    });

    ws.on('close', () => {
        const clientInfo = clients.get(ws);
        if (clientInfo) {
            leaveRoom(ws, clientInfo.roomId, clientId);
        }
        console.log(`👋 Client disconnected: ${clientId}`);
    });

    ws.on('error', (error) => {
        console.error(`❌ WebSocket error for ${clientId}:`, error);
    });
});

/**
 * Handle incoming messages
 */
function handleMessage(ws, data, clientId) {
    console.log(`📨 Message from ${clientId}:`, data.type);

    switch (data.type) {
        case 'join':
            joinRoom(ws, data.roomId, clientId, data.role);
            break;
            
        case 'leave':
            leaveRoom(ws, data.roomId, clientId);
            break;
            
        case 'offer':
        case 'answer':
        case 'ice-candidate':
            forwardToRoom(data.roomId, ws, data, clientId);
            break;
            
        case 'heartbeat':
            ws.send(JSON.stringify({ type: 'heartbeat-ack' }));
            break;
            
        default:
            console.warn(`⚠️ Unknown message type: ${data.type}`);
    }
}

/**
 * Join a room
 */
function joinRoom(ws, roomId, clientId, role = 'viewer') {
    if (!roomId) {
        ws.send(JSON.stringify({
            type: 'error',
            message: 'Room ID required'
        }));
        return;
    }

    // Create room if doesn't exist
    if (!rooms.has(roomId)) {
        rooms.set(roomId, new Set());
        console.log(`🏠 Room created: ${roomId}`);
    }

    // Add client to room
    const room = rooms.get(roomId);
    room.add(ws);
    
    // Track client info
    clients.set(ws, { roomId, clientId, role });

    console.log(`👤 ${clientId} (${role}) joined room: ${roomId} (${room.size} clients)`);

    // Notify client
    ws.send(JSON.stringify({
        type: 'joined',
        roomId: roomId,
        clientId: clientId,
        role: role,
        roomSize: room.size
    }));

    // Notify others in room
    broadcastToRoom(roomId, ws, {
        type: 'peer-joined',
        clientId: clientId,
        role: role,
        roomSize: room.size
    });
}

/**
 * Leave a room
 */
function leaveRoom(ws, roomId, clientId) {
    if (!roomId || !rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    room.delete(ws);

    console.log(`👋 ${clientId} left room: ${roomId} (${room.size} remaining)`);

    // Notify others
    broadcastToRoom(roomId, ws, {
        type: 'peer-left',
        clientId: clientId,
        roomSize: room.size
    });

    // Clean up empty empty rooms
    if (room.size === 0) {
        rooms.delete(roomId);
        console.log(`🗑️ Room deleted: ${roomId}`);
    }
}

/**
 * Forward signaling data to room
 */
function forwardToRoom(roomId, sender, data, senderId) {
    if (!rooms.has(roomId)) {
        sender.send(JSON.stringify({
            type: 'error',
            message: 'Room not found'
        }));
        return;
    }

    const room = rooms.get(roomId);
    
    //Add sender info to data
    const forwardData = {
        ...data,
        from: senderId,
        timestamp: Date.now()
    };

    // Send to all except sender
    room.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(JSON.stringify(forwardData));
        }
    });

    console.log(`📡 Forwarded ${data.type} from ${senderId} in room ${roomId}`);
}

/**
 * Broadcast to room except sender
 */
function broadcastToRoom(roomId, sender, data) {
    if (!rooms.has(roomId)) return;

    const room = rooms.get(roomId);
    const message = JSON.stringify(data);

    room.forEach(client => {
        if (client !== sender && client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });
}

/**
 * Generate unique ID
 */
function generateId() {
    return Math.random().toString(36).substring(2, 10);
}

/**
 * Clean up on shutdown
 */
process.on('SIGTERM', () => {
    console.log('⚠️ SIGTERM received, closing server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\n⚠️ SIGTERM received, closing server...');
    server.close(() => {
        console.log('✅ Server closed');
        process.exit(0);
    });
});
