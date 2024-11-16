import { expressjwt, GetVerificationKey } from 'express-jwt';
import { Request } from 'express';
import jwksClient from 'jwks-rsa';
import { Config } from '../config';

export default expressjwt({
    secret: jwksClient.expressJwtSecret({
        jwksUri: Config.JWKS_URI!,
        cache: true,
        rateLimit: true,
    }) as GetVerificationKey,
    algorithms: ['RS256'],
    getToken(req: Request) {
        console.log(req?.rawHeaders[3].split(';'));
        const tokensArray = req?.rawHeaders[3].split(';');

        const authHeader = req?.headers?.authorization;
        if (authHeader && authHeader.split(' ')[1] !== 'undefined') {
            if (authHeader.split(' ')[1]) return authHeader.split(' ')[1];
        }

        interface Cookies {
            accessToken: string;
        }

        const accessToken = tokensArray[1].split('=')[1];
        return accessToken;
    },
});

/* The provided code snippet is a TypeScript module that sets up JWT (JSON Web Token) authentication middleware for an Express.js application using the express-jwt and jwks-rsa libraries. This middleware is responsible for verifying the authenticity of JWTs in incoming HTTP requests.

First, the code imports the necessary modules: expressjwt and GetVerificationKey from the express-jwt library, and jwksClient from the jwks-rsa library. It also imports a Config object from a local configuration file, which presumably contains various configuration settings for the application.

The expressjwt function is then called to create the JWT authentication middleware. This function takes an options object as its argument. The secret property of this object is set to the result of calling jwksClient.expressJwtSecret. This method configures the middleware to use a JWKS (JSON Web Key Set) endpoint to retrieve the public keys needed to verify the JWTs. The jwksUri property is set to the URI of the JWKS endpoint, which is obtained from the Config.JWKS_URI configuration setting. The cache property enables caching of the keys to improve performance, and the rateLimit and jwksRequestsPerMinute properties are used to limit the number of requests to the JWKS endpoint to prevent abuse.

The algorithms property of the options object specifies that the JWTs must be signed using the RS256 algorithm, which is a commonly used algorithm for signing JWTs with RSA keys.

Overall, this code sets up a robust and secure mechanism for verifying JWTs in an Express.js application, leveraging the express-jwt and jwks-rsa libraries to handle the complexities of key management and token verification. */
