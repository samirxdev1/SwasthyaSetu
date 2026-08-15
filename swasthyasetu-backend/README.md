# SwasthyaSetu Backend Service

This is the Express.js backend API for the **SwasthyaSetu** healthcare platform.

## Folder Structure

```
swasthyasetu-backend/
├── src/
│   ├── routes/
│   │   └── api.js        # API endpoints
│   └── server.js         # Main Express app & server setup
├── .env                  # Environment configuration
├── .env.example          # Environment template
├── .gitignore
└── package.json
```

## Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm run dev
```

The server will run at `http://localhost:5000`.

### 3. API Endpoints
- `GET /` - Root status greeting
- `GET /api/health` - System health status
- `GET /api/status` - Uptime and service version info
