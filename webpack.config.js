// Compress for firefox store version.
// Make sure React devtools works
// CI build to gulp
/**
 * If you are using Firefox and want to use React devtools,
 * use Firefox nightly or start without the flag --firefox,
 * then open about:config and switch network.websocket.allowInsecureFromHTTPS to true
 */
const WebExtensionHotLoadPlugin = require('@dimensiondev/webpack-web-ext-plugin')
module.exports = (argvEnv, argv) => {
    // Loading debuggers
    if (target.FirefoxDesktop) {
        config.plugins.push(
            new WebExtensionHotLoadPlugin({
                sourceDir: dist,
                target: 'firefox-desktop',
                firefoxProfile: src('.firefox'),
                keepProfileChanges: true,
                // --firefox=nightly
                firefox: typeof target.FirefoxDesktop === 'string' ? target.FirefoxDesktop : undefined,
            }),
        )
    }
    if (target.Chromium) {
        config.plugins.push(
            new WebExtensionHotLoadPlugin({
                sourceDir: dist,
                target: 'chromium',
                chromiumProfile: src('.chrome'),
                keepProfileChanges: true,
            }),
        )
    }
    if (target.FirefoxForAndroid) {
        config.plugins.push(new WebExtensionHotLoadPlugin({ sourceDir: dist, target: 'firefox-android' }))
    }
}
