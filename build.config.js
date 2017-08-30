const path = require('path')
let packageJSON = require('./package.json');

/**
 * `electron-packager` options
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-packager.html
 */
module.exports = {
  arch: 'x64',
  asar: true,
  dir: path.join(__dirname, './'),
  name: packageJSON.productName,
  icon: path.join(__dirname, './icons/icon'),
  ignore: /(^\/(node_modules|README.md|yarn.lock|builds|build.config.js|build.js))|\.gitkeep/,
  out: path.join(__dirname, './builds'),
  overwrite: true,
  platform: process.env.BUILD_TARGET || 'all',
  'version-string': {
    'CompanyName': packageJSON.author,
    'FileDescription': packageJSON.description,
    'OriginalFilename': 'atom.exe',
    'ProductName': packageJSON.productName,
    'InternalName': packageJSON.productName
  }
}
