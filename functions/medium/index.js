const express = require("express");
const cors = require("cors");

/* Express with CORS & automatic trailing '/' solution */
const app = express()
app.use(cors({ origin: true }))
app.get("/", getFeed);
app.get("*", notFound);

const mediumRequestHandler = function (request, response) {
  if (!request.path) {
    request.url = `/${request.url}` // prepend '/' to keep query params if any
  }
  return app(request, response);
};

function getFeed(req, res) {
  require('./feed')()
    .then((response) => res.json(response))
    .catch((err) => {
			console.error(err);
			res.status(500).json({ error: 'Couldn\'t fetch posts' })
		});
}

function notFound(req, res) {
  return res.status(404).json({
    error: 'Not Found'
  });
}
module.exports = exports = mediumRequestHandler;
