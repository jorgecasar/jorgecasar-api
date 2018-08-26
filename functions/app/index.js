const prpl = require('prpl-server');
const express = require('express');
const rendertron = require('rendertron-middleware');

const app = express();

const rendertronMiddleware = rendertron.makeMiddleware({
  proxyUrl: 'https://render-tron.appspot.com/render',
  injectShadyDom: true,
});

app.use((req, res, next) => {
  req.headers['host'] = 'jorge-casar.firebaseapp.com';
  return rendertronMiddleware(req, res, next);
});

app.get('/*', prpl.makeHandler('./build', require('../build/polymer.json')));

module.exports = app;
