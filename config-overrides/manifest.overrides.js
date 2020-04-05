const base = require('../src/manifest.json')
/**
 * @param {typeof base} manifest
 */
function firefox(manifest) {
    // TODO: To make `browser.tabs.executeScript` run on Firefox,
    // we need an extra permission "tabs".
    // Switch to browser.userScripts (Firefox only) API can resolve the problem.
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
function WKWebview(manifest) {
    manifest['iOS-injected-scripts'] = ['js/injected-script.js']
    manifest.permissions.push('<all_urls>')
}
function development(manifest, target) {
    manifest.key = // ID：jkoeaghipilijlahjplgbfiocjhldnap
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2WG2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLFp01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYITDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70lKNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
function production(manifest, target) {}
module.exports = { firefox, geckoview, chromium, WKWebview, development, production }
