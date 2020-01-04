import expressJwt from 'express-jwt';

export default function jwt() {
    return expressJwt({ secret: process.env.API_SECRET }).unless({
        path: [
            // public routes that don't require authentication
            '/api/ping',
            '/api/version',
            '/api/users/authenticate',
            '/api/users/invitation',
        ]
    });
}
