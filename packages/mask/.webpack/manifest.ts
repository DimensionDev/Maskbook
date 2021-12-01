/* spell-checker: disable */
import emitFile from '@nice-labs/emit-file-webpack-plugin'
import { cloneDeep } from 'lodash-unified'
import { NormalizedFlags } from './flags'

type Manifest = typeof import('../src/manifest.json') & Record<string, any>
export function emitManifestFile(flags: NormalizedFlags) {
    return emitFile({
        name: 'manifest.json',
        content() {
            const manifest: Manifest = cloneDeep(require('../src/manifest.json'))
            modify(manifest, flags)
            return JSON.stringify(manifest, null, 4)
        },
    })
}
function modify(manifest: Manifest, flags: NormalizedFlags) {
    if (flags.runtime.engine === 'firefox') {
        // TODO: To make `browser.tabs.executeScript` run on Firefox, we need an extra permission "tabs".
        // Switch to browser.userScripts (Firefox only) API can resolve the problem.
        manifest.permissions.push('tabs')

        if (flags.runtime.architecture === 'app') {
            manifest.permissions.push('nativeMessaging', 'nativeMessagingFromContent', 'geckoViewAddons')
            manifest.applications = { gecko: { id: 'info@dimension.com' } }
        }
    }
    // Grant all URL permissions on App
    if (flags.runtime.architecture === 'app') manifest.permissions.push('<all_urls>')

    if (flags.channel === 'beta') {
        manifest.name += ' (Beta)'
    } else if (flags.channel === 'insider') {
        manifest.name += ' (Nightly)'
    }
    if (flags.mode === 'development') {
        manifest.name += ' (dev)'
        // for eval-source-map
        manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; object-src 'self';`
        acceptExternalConnect(manifest)
        stableDevelopmentExtensionID(manifest)
    }

    // Mask 2.0
    if (flags.mode === 'development' || flags.channel === 'beta' || flags.channel === 'insider') {
        manifest.browser_action = { default_popup: 'popups.html' }
    }

    if (flags.hmr) {
        manifest.web_accessible_resources.push('*.json', '*.js')
    }
    if (flags.runtime.manifest === 3) {
        // https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
        manifest.manifest_version = 3

        manifest.permissions = manifest.permissions.filter((x) => !x.startsWith('http'))
        manifest.optional_permissions = manifest.optional_permissions.filter((x) => x !== '<all_urls>')
        manifest.host_permissions = ['<all_urls>']

        if (manifest.content_security_policy) {
            const oldCSP = manifest.content_security_policy.replace("'unsafe-eval'", '')
            manifest.content_security_policy = {
                extension_pages: oldCSP,
            }
        }

        manifest.action = manifest.browser_action
        Reflect.deleteProperty(manifest, 'browser_action')

        manifest.web_accessible_resources = [
            {
                matches: ['<all_urls>'],
                resources: flags.hmr ? ['js/*', '*.json', '*.js'] : ['js/*'],
            },
        ] as any
        manifest.background = { service_worker: '/manifest-v3.entry.js' } as any
    }
}

// ID: jkoeaghipilijlahjplgbfiocjhldnap
// Note: with tihs key you cannot upload it to the extension store
function stableDevelopmentExtensionID(manifest: Manifest) {
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
