# RAZ OBS Signaling Server

WebSocket signaling server for cross-network P2P streaming.

## Features

- ✅ Room-based signaling
- ✅ Offer/Answer/ICE candidate forwarding
- ✅ Automatic room cleanup
- ✅ Client tracking
- ✅ Heartbeat support

## Installation

```bash
npm install
```

## Run Locally

```bash
npm start
```

Server will run on port 8080 (or PORT env variable).

## Deploy to Railway

1. Push to GitHub
2. Go to https://railway.app
3. New Project → Deploy from GitHub
4. Select this repo
5. Railway will auto-detect and deploy
6. Copy WebSocket URL (wss://your-app.up.railway.app)

## Deploy to Render

1. Push to GitHub
2. Go to https://render.com
3. New Web Service
4. Connect GitHub repo
5. Build Command: `npm install`
6. Start Command: `npm start`
7. Copy WebSocket URL

## Environment Variables

- `PORT` - Server port (default: 8080)
- `NODE_ENV` - Environment (production/development)

## Testing

Connect to `ws://localhost:8080` for local testing.

## License

MIT
