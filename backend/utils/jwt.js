import expressJwt from 'express-jwt';

export default function jwt() {
    return expressJwt({ secret: process.env.API_SECRET }).unless({
        path: [
            // Öffentliche Routen, die keine Authentifizierung erfordern
            '/api/ping',
            '/api/version',
            '/api/users/authenticate',
            '/api/users/invitation',
        ]
    });
}
