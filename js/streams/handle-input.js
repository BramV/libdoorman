'use strict';

const through = require('through2');
const fork = require('pipe-iterators').fork;
const request = require('request');

function drop() {
  return through.obj(function (_, __, cb) {
    cb(null);
  });
}

function sendToIfttt(channel, song, ifttt) {
  const url = `https://maker.ifttt.com/trigger/${ifttt.event}/with/key/${ifttt.key}`;
  const hasSong = song && song > 0;
  channel = +channel;

  return through.obj(function (hit, _, cb) {
    if (hit.channel !== channel || (hasSong && song !== hit.song)) {
      // drop
      return cb(null);
    }

    console.log(`Sending ${ifttt.event} event to IFTTT for channel ${channel}${hasSong ? ` and song ${song}` : ''}`);
    request(url, function (error, response) {
      if (error) {
        console.log('Error while contacting IFTTT');
        return cb(error);
      }

      if (response.statusCode !== 200) {
        console.log(`Got HTTP response code ${response.statusCode} from IFTTT`);
        return cb(response.statusCode);
      }

      console.log(`Event ${ifttt.event} sent to IFTTT`);
      cb(null);
    });
  });
}

module.exports = function createHandleStream(configs) {
  if (!configs) {
    return drop();
  }

  if (!Array.isArray(configs)) {
    configs = [ configs ];
  }

  if (configs.length === 0) {
    return drop();
  }

  return fork(configs.map(function (config) {
    const streams = [];

    if (config.ifttt) {
      streams.push(sendToIfttt(config.channel, config.song, config.ifttt));
    }

    if (streams.length) {
      return fork(streams);
    } else {
      return drop();
    }
  }));
}