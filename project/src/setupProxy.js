// src/setupProxy.js
const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    createProxyMiddleware('/users', {
      target: 'http://52.78.201.133:8080',
      changeOrigin: true,
    }),
  );
};