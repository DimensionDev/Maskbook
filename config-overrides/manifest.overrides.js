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
 * Geckoview is firefox with some quirks.
 * @param {typeof base} manifest
 */
function geckoview(manifest) {
    firefox(manifest)
    manifest.permissions.push('<all_urls>')
}
/**
 * @param {typeof base} manifest
 */
function chromium(manifest) {}
/**
 * @param {typeof base} manifest
 */
function WKWebview(manifest) {}
module.exports = { firefox, geckoview, chromium, WKWebview }
