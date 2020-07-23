import type base from '../../src/manifest.json'
export function firefox(manifest: typeof base) {
    // TODO: To make `browser.tabs.executeScript` run on Firefox,
    // we need an extra permission "tabs".
    // Switch to browser.userScripts (Firefox only) API can resolve the problem.
    manifest.permissions.push('tabs')
}
/**
 * Geckoview is firefox with some quirks. It is used in our Android App.
 */
export function geckoview(manifest: typeof base) {
    firefox(manifest)
    manifest.permissions.push('<all_urls>')
}
// Good. No need to modify if it is Chrome.
export function chromium(manifest: typeof base) {}
export function safari(manifest: typeof base) {
    // @ts-ignore
    // iOS native will handle this for us
    manifest['iOS-injected-scripts'] = ['js/injected-script.js']
    manifest.permissions.push('<all_urls>')
}
export function development(manifest: typeof base) {
    manifest.name = 'Maskbook (development)'
    // @ts-ignore
    manifest.key = // ID：jkoeaghipilijlahjplgbfiocjhldnap
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
// test environment
export function E2E(manifest: typeof base) {
    // can not capture permission dialog in pptr
    manifest.permissions = Array.from(
        new Set([...manifest.permissions, ...manifest.optional_permissions, ...['<all_urls>']]),
    )
    manifest.optional_permissions = []
}
export function production(manifest: typeof base) {}
