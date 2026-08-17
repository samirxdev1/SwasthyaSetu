# SwasthyaSetu Backend Service

Unified Express.js API server for **SwasthyaSetu** serving React Web App (Doctor + Laboratory Dashboards) and React Native Mobile App (Patient).

## Folder Structure

```
swasthyasetu-backend/
├── src/
│   ├── config/
│   │   ├── supabaseClient.js
│   │   ├── env.js
│   │   └── llmClients.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── doctorRoutes.js
│   │   ├── laboratoryRoutes.js
│   │   ├── patientRoutes.js
│   │   ├── consultationRoutes.js
│   │   ├── prescriptionRoutes.js
│   │   ├── labOrderRoutes.js
│   │   ├── labReportRoutes.js
│   │   ├── chronicConditionRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── aiRoutes.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── doctorController.js
│   │   ├── laboratoryController.js
│   │   ├── patientController.js
│   │   ├── consultationController.js
│   │   ├── prescriptionController.js
│   │   ├── labOrderController.js
│   │   ├── labReportController.js
│   │   ├── chronicConditionController.js
│   │   ├── notificationController.js
│   │   └── aiController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleCheckMiddleware.js
│   │   ├── errorHandler.js
│   │   └── uploadMiddleware.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── aiService.js
│   │   ├── storageService.js
│   │   └── notificationService.js
│   ├── utils/
│   │   ├── logger.js
│   │   ├── responseFormatter.js
│   │   └── validators.js
│   ├── constants/
│   │   ├── roles.js
│   │   └── statusCodes.js
│   ├── app.js
│   └── server.js
├── .env.example
├── .gitignore
├── package.json
├── nodemon.json
└── README.md
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
