import app from './app.js';
import config from './config/env.js';

const PORT = config.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 SwasthyaSetu Backend Server running in ${config.NODE_ENV} mode on port ${PORT}`);
});

