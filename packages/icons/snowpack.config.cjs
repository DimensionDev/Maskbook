// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
    mount: {},
    plugins: [],
    packageOptions: {
        external: ['@material-ui/core/OverridableComponent'],
    },
    devOptions: {},
    buildOptions: {},
    exclude: ['**/node_modules/**/*', './dist/**/*'],
}
