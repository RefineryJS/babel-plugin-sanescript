var semver = require('semver')

var NODE_VERSION = process && process.version

if (process.browser) {
  module.exports = require('./es5')['default']
} else if (semver.gte(NODE_VERSION, '5.0.0')) {
  module.exports = require('./node5')['default']
} else if (semver.gte(NODE_VERSION, '4.0.0')) {
  module.exports = require('./node4')['default']
} else {
  module.exports = require('./es5')['default']
}
