module.exports = errorHandler;

function errorHandler(err, req, res, next) {
    if (typeof (err) === 'string') {
        // Fehlermeldung ausgeben
        return res.status(400).json({ status: 'error', message: err });
    }

    if (err.name === 'UnauthorizedError') {
        // JWT - Authentifizierungsfehler
        return res.status(401).json({ status: 'error', message: 'Unauthorized' });
    }

    // Notfalls einen 500er Fehler schmeißen (passiert hoffentlich nie)
    return res.status(500).json({ status: 'error', message: err.message });
}
