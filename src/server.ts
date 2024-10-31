import { Config } from './config';
import app from './app';
const startServer = () => {
    try {
        app.listen(Config.PORT, () => console.log('server is running'));
        console.log(`Server started on port ${Config.PORT}`);
    } catch (err) {
        console.error(err);
    }
};

startServer();
