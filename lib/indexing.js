const fs = require('fs');

const { resolve } = require('path');

const Parser = {
  indexToken: '// K-index:',
};

function fileParser(file, srcPath) {
  try {
    const data = fs.readFileSync(resolve(srcPath, file), 'utf-8');
    const temp = [];
    data.split('\n').map((line) => {
      if (line.includes(Parser.indexToken)) {
        temp.push({
          file,
          index: line.split(':')[1],
        });
      }
    });
    return temp;
  } catch (err) {
    console.log('[Katargha]:', err.message);
  }
  return null;
}

module.exports = {
  fileParser,
};
