import { Config } from './config';
import app from './app';
import { logger } from './config/logger';
import { AppDataSource } from './config/data-source';
const startServer = async () => {
    try {
        await AppDataSource.initialize();
        logger.info('Database connected successfully');

        app.listen(Config.PORT, () =>
            logger.info('server is running on port ', {
                port: Config?.PORT,
            }),
        );
    } catch (err) {
        if (err instanceof Error) {
            logger.error('Failed to connect to database:', err);
            setTimeout(() => {
                process.exit(1);
            }, 1000);
        }
    }
};

startServer().catch((err) => {
    console.error('Failed to start server:', err);
});
