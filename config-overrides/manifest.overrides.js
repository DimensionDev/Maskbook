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
    manifest.applications = {
        gecko: {
            id: 'info@dimension.com',
        },
    }
}
/**
 * @param {typeof base} manifest
 */
function chromium(manifest) {}
/**
 * @param {typeof base} manifest
 */
function safari(manifest) {
    manifest['iOS-injected-scripts'] = ['js/injected-script.js']
    manifest.permissions.push('<all_urls>')
}
/**
 * @param {typeof base} manifest
 */
function development(manifest, target) {
    manifest.name = 'Maskbook (development)'
    // Required by eval-source-map in development
    manifest.content_security_policy = "script-src 'self' blob: filesystem: 'unsafe-eval';"
    manifest.key = // ID：jkoeaghipilijlahjplgbfiocjhldnap
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
/**
 * @param {typeof base} manifest
 */
function E2E(manifest) {
    // can not capture premission dialog in pptr
    manifest.permissions = Array.from(
        new Set([...manifest.permissions, ...manifest.optional_permissions, ...['<all_urls>']]),
    )
    manifest.optional_permissions = []
}
function production(manifest, target) {}
module.exports = { firefox, geckoview, chromium, safari, development, production, E2E }
