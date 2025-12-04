import app from './app';
import connectDB from './config/database';
import { config } from './config/env';

const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    
    // Start Express server
    const PORT = config.server.port;
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${config.server.nodeEnv}`);
      console.log(`🌐 CORS origin: ${config.cors.origin}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
