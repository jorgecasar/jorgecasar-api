const functions = require('firebase-functions');

module.exports = {
	app: functions.https.onRequest(require('./app')),
	medium: functions.https.onRequest(require('./medium'))
};
