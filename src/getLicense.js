const path = require('path');
const fs = require('fs');

const LICENSE_FILENAMES = [
  /^LICENSE$/,
  /^LICENSE\-\w+$/, // e.g. LICENSE-MIT
  /^LICENCE$/,
  /^LICENCE\-\w+$/, // e.g. LICENCE-MIT
];

function isLicenseFile(filename) {
  return !!LICENSE_FILENAMES.find(licenseFilePattern => licenseFilePattern.test(filename.toUpperCase()));
}


// Find and list license files in the precedence order
module.exports = function (assetPath, projectRoot) {
  let traversePath = assetPath;

  while (traversePath = path.dirname(traversePath)) {
    if (path.basename(traversePath) === 'node_modules' ||
      path.normalize(traversePath) === path.normalize(projectRoot)) {
      return;
    }
    const dirFiles = fs.readdirSync(traversePath);
    const foundLicenseFile = dirFiles.find((filename) => isLicenseFile(filename));
    if(foundLicenseFile) {
      try{
        const package = require(path.join(traversePath, 'package.json'));
        license = fs.readFileSync(path.join(traversePath, foundLicenseFile), { encoding: 'utf8' });
        return { license, package };
      } catch (e) {
        // should I output error message?
      }
    }
  }
  return;
};
