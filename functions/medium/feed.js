const admin = require('firebase-admin');
const functions = require('firebase-functions');
if (!admin.apps.length) {
  admin.initializeApp(functions.config().firebase);
}
const db = admin.firestore();
const mediumRef = db.collection('feeds').doc('medium');

const axios = require('axios');
const convert = require('xml-js');

const FEED_URL = 'https://medium.com/feed/';
const FEED_USER = 'jorgecasar';

module.exports = getFeed;

function getFeed() {
  return getFeedFromDb().then(updateIfExpired);
}

function updateIfExpired(data) {
  if (data && data.expiredAt < new Date()) {
    return data;
  } else {
    return getFeedFromRemote();
  }
}

function getFeedFromDb() {
  return mediumRef.get().then(doc => doc.exists && doc.data());
}

function saveFeedToDb(feed) {
  debugger;
  let tomorrow = ( d => new Date(d.setDate(d.getDate()+1)) )(new Date());
  feed.updatedAt = admin.firestore.Timestamp.fromDate(new Date());
  feed.expiredAt = admin.firestore.Timestamp.fromDate(tomorrow);
  return mediumRef.update(feed);
}

function getFeedFromRemote() {
  return axios.get(`${FEED_URL}@${FEED_USER}`)
    .then(parseFeed)
    .then(parseChannel)
    .then(saveFeedToDb)
    .then(getFeedFromDb);
}

function parseFeed(feed) {
  const options = {
    compact: true,
    ignoreComment: true,
    ignoreDoctype: true,
    ignoreInstruction: true,
    ignoreDeclaration: true,
    alwaysChildren: true,
    attributesKey: 'value',
    cdataKey: 'value',
    textKey: 'value'
  };
  const result = convert.xml2js(feed.data, options);
  return Promise.resolve(result.rss.channel);
}

function parseChannel(channel) {
  const {title, description, link, image} = channel;
  return {
    title: title.value,
    description: description.value,
    link: link.value,
    image: image.url.value,
    items: getItemFromChannel(channel)
  };
}

function getItemFromChannel(channel) {
  return channel.item.map((post) => {
    const {title, link, category, pubDate, guid } = post;
    const matches = /\/([a-z0-9]*)$/gm.exec(guid.value[1]);
    return {
      id: matches[1],
      title: title.value,
      link: link.value,
      categories: category.map((cat) => cat.value),
      pubDate: admin.firestore.Timestamp.fromDate(new Date(pubDate.value)),
      guid: guid.value[1]
    };
  });
}
