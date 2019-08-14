const fs = require('fs');

// Source: https://techoverflow.net/2012/09/16/how-to-get-filesize-in-node-js/
function getFileSizeInBytes(filename) {
  const stats = fs.statSync(filename);
  const fileSizeInBytes = stats.size;
  return fileSizeInBytes;
}

module.exports = {
  getFileSizeInBytes,
};
