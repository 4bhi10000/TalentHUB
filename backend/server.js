const app = require('./src/app');
const config = require('./src/config/appConfig');
const { connectDatabase } = require('./src/config/database');

const PORT = config.port;

async function startServer() {
  try {
    // Ensure database connection and foreign key enforcement
    await connectDatabase();
    console.log('✓ SQLite database connected with foreign key enforcement.');

    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`🚀 TalentHub Backend Server running on port ${PORT}`);
      console.log(`📡 Environment: ${config.nodeEnv}`);
      console.log(`🔗 Health Check: http://localhost:${PORT}/api/health`);
      console.log(`====================================================`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
