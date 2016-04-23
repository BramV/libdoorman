'use strict';

const through = require('through2');
const pipeline = require('pipe-iterators').pipeline;

const inputStream = require('./streams/input');
const dedupeStream = require('./streams/dedupe');
const handleInputStream = require('./streams/handle-input');

const logStream = through.obj(function (hit, _, cb) {
  console.log(JSON.stringify(hit));
  cb(null, hit);
});

let config = null;

try {
  config = require('./config.json');
} catch (e) {
  console.error('Create config.json (use config.json.base as template) to configure how to handle the input');
}

inputStream().pipe(
  pipeline(
    dedupeStream(),
    logStream,
    handleInputStream(config)
  ).on('error', console.error)
);
