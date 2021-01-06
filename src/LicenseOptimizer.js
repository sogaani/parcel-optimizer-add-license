const { Optimizer } = require('@parcel/plugin');
const {
  countLines,
} = require('@parcel/utils');
const SourceMap = require('@parcel/source-map').default;
const getLicense = require('./getLicense');

function createLicenseHeader(package) {
  let header = '';
  header += ' * ' + package.name + ':\n * ';
  header += package.license.replace(/\n/g,'\n * ');
  header += '\n';
  return header;
}

function createHeader(packages) {
  let header = '';
  header += '/**\n';
  header += ' * @license\n';
  header += ' *\n';
  const keys = Object.keys(packages);
  keys.sort();
  keys.forEach(function (key) {
      header += createLicenseHeader(packages[key]);
  });
  header += ' */\n';
  return header;
}

module.exports = new Optimizer({
  async optimize({
    bundle,
    contents,
    map,
    options
  }) {
    const packages = {};
    bundle.traverse(node => {
      if (node.type !== 'asset') {
        return;
      }
      const asset = node.value;
      const filePath = asset.filePath;
      const licenseInfo = getLicense(filePath, options.projectRoot);
      if(licenseInfo) {
        packages[licenseInfo.package.name] = {...licenseInfo.package, license: licenseInfo.license}
      }
    });
    const header = createHeader(packages);
    const newMap = new SourceMap(options.projectRoot);
    if (options.sourceMaps) {
      const mapBuffer = map.toBuffer();
      const lineOffset = countLines(header) - 1;
      newMap.addBufferMappings(mapBuffer, lineOffset);
    }
    
    return { contents: header + contents, map: newMap };
  },
});
