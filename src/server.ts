import { Config } from './config';
import app from './app';
import { logger } from './config/logger';
const startServer = () => {
    try {
        app.listen(Config.PORT, () =>
            logger.info('server is running on port ', {
                port: Config?.PORT,
            }),
        );
    } catch (err) {
        console.error(err);
    }
};

startServer();
