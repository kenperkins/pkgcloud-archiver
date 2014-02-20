### pkgcloud-archiver

This is a simple archiver designed for moving time-series data and purging the
local copy on successful upload. Presently it uses [Rackspace Cloud Files][0] (via
[pkgcloud][1]) as it computes the md5 hash
of the files, and optionally deleting them on successful upload.

It was designed for hourly database snapshots or log rotations where you have no
desire to keep these on the local box. **It is very much a limited proof of
concept**. As such I have *not published* this to npm.

#### Setup

You need to add a `config.json` to the local directory, and then run:

```javascript
{
  "auth": {
    "username": "your-rackspace-username",
    "apiKey": "your-api-key",
    "region": "ORD" // As appropraite
  },
  "container": "your-container-name",
  "deleteOnSuccess": true,
  "archive": {
    "path": "/tmp",
    "extname": ".gz"
  }
}
```

#### Execution

```bash
> node index.js
```

[0]: http://www.rackspace.com/cloud/files/
[1]: https://github.com/pkgcloud/pkgcloud
