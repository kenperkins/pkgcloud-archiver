var async = require('async'),
  config = require('./config.json'),
  crypto = require('crypto'),
  fs = require('fs'),
  path = require('path'),
  pkgcloud = require('pkgcloud');

var client = pkgcloud.providers.rackspace.storage.createClient(config.auth);

var files = fs.readdirSync(config.archive.path);

console.log('Archiving ' + config.archive.path);
async.forEachSeries(files, function(handle, next) {

  var filename = path.join(config.archive.path, handle);
  if (fs.lstatSync(filename).isDirectory()) {
    console.log('Skipping directory ' + filename);
    next();
    return;
  }
  else if (path.extname(filename) !== config.archive.extname) {
    console.log('Skipping non-match extension: ' + filename);
    next();
    return;
  }

  console.log('Archiving ' + config.archive.path + '/' + handle);
  computeMD5(filename, function(err, md5) {
    if (err) {
      next(err);
      return;
    }

    var source = fs.createReadStream(filename);

    var dest = client.upload({
      remote: handle,
      container: config.container,
      headers: {
        'Etag': md5
      }
    }, function(err) {
      if (err) {
        next(err);
        return;
      }

      console.log('Cleaning ' + config.archive.path + '/' + handle);
      if (config.deleteOnSuccess) {
        fs.unlink(filename, next);
      }
      else {
        next();
      }
    });

    source.pipe(dest);

  });
}, function(err) {
  if (err) {
    console.dir(err);
    process.exit(1);
    return;
  }

  process.exit(0);
});

function computeMD5(path, callback) {
  var fd = fs.createReadStream(path),
    hash = crypto.createHash('md5'),
    calledBack = false;

  hash.setEncoding('hex');

  fd.on('end', function() {
    hash.end();
    cb(null, hash.read());
  });

  fd.on('error', function(err) {
    cb(err);
  });

  fd.pipe(hash);
  
  function cb(err, hash) {
    if (calledBack) {
      return;
    }

    calledBack = true;
    callback(err, hash);
  }
}