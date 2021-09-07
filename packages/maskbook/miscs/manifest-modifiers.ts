/* spell-checker: disable */
import base from '../src/manifest.json'
type Manifest = typeof base & Record<string, any>
export function manifestV3(manifest: Manifest) {
    const isDev = manifest.content_security_policy
    // https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
    manifest.manifest_version = 3
    manifest.permissions = manifest.permissions.filter((x) => !x.startsWith('http'))
    manifest.optional_permissions = manifest.optional_permissions.filter((x) => x !== '<all_urls>')
    manifest.host_permissions = ['<all_urls>']
    if (manifest.content_security_policy) {
        const old = manifest.content_security_policy.replace("'unsafe-eval'", '')
        manifest.content_security_policy = { extension_pages: old }
    }
    manifest.action = manifest.browser_action
    delete manifest.browser_action
    manifest.web_accessible_resources = [
        {
            resources: isDev ? ['js/*', '*.json', '*.js'] : ['js/*'],
            matches: ['<all_urls>'],
        } as any,
    ]
    manifest.background = { service_worker: '/manifest-v3.entry.js' } as any
}
export function firefox(manifest: Manifest) {
    // TODO: To make `browser.tabs.executeScript` run on Firefox,
    // we need an extra permission "tabs".
    // Switch to browser.userScripts (Firefox only) API can resolve the problem.
    manifest.permissions.push('tabs')
}
/** Geckoview is firefox with some quirks. */
export function geckoview(manifest: Manifest) {
    firefox(manifest)
    manifest.permissions.push('nativeMessaging', 'nativeMessagingFromContent', 'geckoViewAddons', '<all_urls>')
    manifest.applications = {
        gecko: {
            id: 'info@dimension.com',
        },
    }
}
export function chromium(manifest: Manifest) {}
export function safari(manifest: Manifest) {
    manifest['iOS-injected-scripts'] = ['injected-script.js']
    manifest.permissions.push('<all_urls>')
}
export function development(manifest: Manifest) {
    manifest.name += ' (development)'
    // required by Webpack HMR
    manifest.web_accessible_resources.push('*.json', '*.js')
    manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; object-src 'self';`
    manifest.browser_action = { default_popup: 'popups.html' }
    acceptExternalConnect(manifest)
    jkoeaghipilijlahjplgbfiocjhldnap(manifest)
}
// ID: jkoeaghipilijlahjplgbfiocjhldnap
// Note: with tihs key you cannot upload it to the extension store
function jkoeaghipilijlahjplgbfiocjhldnap(manifest: Manifest) {
    manifest.key =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}

function acceptExternalConnect(manifest: Manifest) {
    manifest.externally_connectable = {
        ids: ['*'],
        // It seems like *.netlify.app or *compassionate-northcutt-326a3a.netlify.app does not work so it is not possible to provide a preview for PRs
        matches: ['*://localhost:*/*', '*://127.0.0.1:*/*', 'https://compassionate-northcutt-326a3a.netlify.app//*'],
    }
}
export function production(manifest: Manifest) {}
export function E2E(manifest: Manifest) {
    development(manifest)
    // can not capture permission dialog in pptr
    manifest.permissions = Array.from(
        new Set([...manifest.permissions, ...manifest.optional_permissions, ...['<all_urls>']]),
    )
    manifest.optional_permissions = []
}
export function beta(manifest: Manifest) {
    manifest.name += ' (Beta)'
    manifest.browser_action = { default_popup: 'popups.html' }
    acceptExternalConnect(manifest)
    jkoeaghipilijlahjplgbfiocjhldnap(manifest)
}
export function nightly(manifest: Manifest) {
    manifest.name += ' (Nightly)'
    manifest.browser_action = { default_popup: 'popups.html' }
    jkoeaghipilijlahjplgbfiocjhldnap(manifest)
    acceptExternalConnect(manifest)
}
