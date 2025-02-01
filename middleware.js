const express = require('express');

// utility middleware for the app
function logRequest(req, res, next) {
    console.log('[' + Date.now() + '] incoming request: ' + req.url);
    next();
}

function logResponse(req, res, next) {
    console.log('[' + Date.now() + '] replying with ' + res.statusCode);
    next();
}

firstMiddleware = [logRequest];
lastMiddleware = [logResponse];

module.exports = { firstMiddleware, lastMiddleware };