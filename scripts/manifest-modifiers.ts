import base from '../packages/maskbook/src/manifest.json'
type Manifest = typeof base & { [key: string]: any }
export function firefox(manifest: Manifest) {
    // TODO: To make `browser.tabs.executeScript` run on Firefox,
    // we need an extra permission "tabs".
    // Switch to browser.userScripts (Firefox only) API can resolve the problem.
    manifest.permissions.push('tabs')
}
/** Geckoview is firefox with some quirks. */
export function geckoview(manifest: Manifest) {
    firefox(manifest)
    manifest.permissions.push(
        'nativeMessaging', 
        'nativeMessagingFromContent', 
        'geckoViewAddons', 
        '<all_urls>')
    manifest.applications = {
        gecko: {
            id: 'info@dimension.com',
        },
    }
}
export function chromium(manifest: Manifest) {}
export function safari(manifest: Manifest) {
    manifest['iOS-injected-scripts'] = ['js/injected-script.js']
    manifest.permissions.push('<all_urls>')
}
export function development(manifest: Manifest) {
    manifest.name = 'Maskbook (development)'
    // required by Webpack HMR
    manifest.web_accessible_resources.push('*.json', '*.js')
    // 8097 is react devtools
    // connect-src is used by firefox
    manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; connect-src * https://localhost:8080/ http://localhost:8097; object-src 'self';`
    manifest.permissions.push('https://localhost:8080/*', 'http://localhost:8087/*')
    manifest.key = // ID：jkoeaghipilijlahjplgbfiocjhldnap
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
export function E2E(manifest: Manifest) {
    development(manifest)
    // can not capture permission dialog in pptr
    manifest.permissions = Array.from(
        new Set([...manifest.permissions, ...manifest.optional_permissions, ...['<all_urls>']]),
    )
    manifest.optional_permissions = []
}
export function production(manifest: Manifest) {}
