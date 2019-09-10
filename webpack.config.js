/**
 * @desc
 * Some third party tools, like react-cosmos relies on your webpack config.
 * Let them read this.
 */

const { paths } = require('react-app-rewired')
// require normalized overrides
const overrides = require('react-app-rewired/config-overrides')
const config = require(paths.scriptVersion + '/config/webpack.config.dev')

module.exports = overrides.webpack(config, process.env.NODE_ENV)
