/* spell-checker: disable */
import emitFile from '@nice-labs/emit-file-webpack-plugin'
import { cloneDeep } from 'lodash-unified'
import { NormalizedFlags } from './flags'

type ManifestV2 = typeof import('../src/manifest.json') & { key?: string }
type ManifestV3 = typeof import('../src/manifest-v3.json') & { key?: string }

export function emitManifestFile(flags: NormalizedFlags) {
    return emitFile({
        name: 'manifest.json',
        content() {
            const manifest = cloneDeep(
                flags.runtime.manifest === 2 ? require('../src/manifest.json') : require('../src/manifest-v3.json'),
            )
            modify(manifest, flags)
            return JSON.stringify(manifest, null, 4)
        },
    })
}

function modify(manifest: ManifestV2 | ManifestV3, flags: NormalizedFlags) {
    if (flags.channel === 'beta') {
        manifest.name += ' (Beta)'
    } else if (flags.channel === 'insider') {
        manifest.name += ' (Nightly)'
    }

    if (flags.mode === 'development') {
        manifest.name += ' (dev)'
        stableDevelopmentExtensionID(manifest)
    }

    if (manifest.manifest_version === 2) modify_2(manifest as ManifestV2, flags)
    else modify_3(manifest as ManifestV3, flags)
}

function modify_2(manifest: ManifestV2, flags: NormalizedFlags) {
    if (flags.runtime.engine === 'firefox') {
        // TODO: To make `browser.tabs.executeScript` run on Firefox, we need an extra permission "tabs".
        // Switch to browser.userScripts (Firefox only) API can resolve the problem.
        manifest.permissions.push('tabs')

        if (flags.runtime.architecture === 'app') {
            manifest.permissions.push('nativeMessaging', 'nativeMessagingFromContent', 'geckoViewAddons')
            manifest.applications = { gecko: { id: 'info@dimension.im' } }
        }
    }

    // Grant all URL permissions on App
    if (flags.runtime.architecture === 'app') manifest.permissions.push('<all_urls>')

    // for eval-source-map
    if (flags.mode === 'development') {
        manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; object-src 'self'; require-trusted-types-for 'script'; trusted-types default dompurify webpack mask ssr`
    }

    if (flags.hmr) {
        manifest.web_accessible_resources.push('*.json', '*.js')
    }
}

// https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
function modify_3(manifest: ManifestV3, flags: NormalizedFlags) {}

// cspell: disable-next-line
// ID: jkoeaghipilijlahjplgbfiocjhldnap
// Note: with tihs key you cannot upload it to the extension store
function stableDevelopmentExtensionID(manifest: ManifestV2 | ManifestV3) {
    manifest.key =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
