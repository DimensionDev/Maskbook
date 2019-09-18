const base = require('../src/manifest.json')
/**
 * @param {typeof base} manifest
 */
function firefox(manifest) {
    // TODO: To make `browser.tabs.executeScript` run on Firefox,
    // TODO: we need an extra permission "tabs".
    // TODO: Switch to browser.userScripts (Firefox only) API can resolve the problem.
    manifest.permissions.push('tabs')
}
/**
 * @param {typeof base} manifest
 */
function firefoxAndroid(manifest) {
    firefox(manifest)
}
/**
 * @param {typeof base} manifest
 */
function firefoxGeckoview(manifest) {
    firefox(manifest)
    manifest.permissions.push('<all_urls>')
}
/**
 * @param {typeof base} manifest
 */
function firefoxDesktop(manifest) {
    firefox(manifest)
}
/**
 * @param {typeof base} manifest
 */
function chromium(manifest) {}
/**
 * @param {typeof base} manifest
 */
function WKWebview(manifest) {}
module.exports = { firefox, firefoxAndroid, firefoxDesktop, firefoxGeckoview, chromium, WKWebview }
