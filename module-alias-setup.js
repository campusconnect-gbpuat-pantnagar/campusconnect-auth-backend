// module-alias-setup.js
const moduleAlias = require('module-alias');
const path = require('path');

const rootDir = path.resolve(__dirname, 'dist');
moduleAlias.addAliases({
  '@': rootDir,
});
