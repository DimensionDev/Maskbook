/* spell-checker: disable */
import emitFile from '@nice-labs/emit-file-webpack-plugin'
import type { ComputedFlags, NormalizedFlags } from './flags.js'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'

const cloneDeep = (x: any) => JSON.parse(JSON.stringify(x))
const require = createRequire(import.meta.url)
export function emitManifestFile(flags: NormalizedFlags, computedFlags: ComputedFlags) {
    return emitFile.default({
        name: 'manifest.json',
        content() {
            const manifest = cloneDeep(
                flags.manifest === 2 ? require('../src/manifest.json') : require('../src/manifest-v3.json'),
            )
            editManifest(manifest, flags, computedFlags)
            return JSON.stringify(manifest, null, 4)
        },
    })
}

function prepareAllManifest(flags: NormalizedFlags, computedFlags: ComputedFlags) {
    const mv2Base = JSON.parse(readFileSync(new URL('./manifest/manifest.json'), 'utf-8'))
    const mv3Base = JSON.parse(readFileSync(new URL('./manifest/manifest-mv3.json'), 'utf-8'))

    const manifestFlags = new Map<string, [flags: ModifyAcceptFlags, base: any, modify?: (manifest: any) => void]>([
        ['manifest-chromium-mv2.json', [{ ...flags }, mv2Base]],
        ['manifest-chromium-mv3.json', [{ ...flags }, mv3Base]],
        ['manifest-firefox-mv2.json', [{ ...flags }, mv2Base, (manifest) => manifest.permissions.push('tabs')]],
        ['manifest-firefox-mv3.json', [{ ...flags }, mv3Base]],
        ['manifest-safari-mv3.json', [{ ...flags }, mv3Base]],
    ])
    const manifest = new Map<string, any>()
    for (const [fileName, [flags, baseObject, modifier]] of manifestFlags) {
        const fileContent = cloneDeep(baseObject)
        editManifest(fileContent, flags, computedFlags)
        modifier?.(fileContent)
        manifest.set(fileName, fileContent)
    }
}

type ModifyAcceptFlags = Pick<NormalizedFlags, 'mode' | 'channel' | 'devtools' | 'hmr'>
function editManifest(manifest: any, flags: ModifyAcceptFlags, computedFlags: ComputedFlags) {
    if (flags.mode === 'development') manifest.name += ' (dev)'
    else if (flags.channel === 'beta') manifest.name += ' (beta)'
    else if (flags.channel === 'insider') manifest.name += ' (insider)'

    if (flags.mode === 'development') fixTheExtensionID(manifest)
    if (flags.mode === 'production' && flags.channel !== 'stable') fixTheExtensionID(manifest)
    if (flags.devtools) manifest.devtools_page = 'devtools-background.html'

    const topPackageJSON = JSON.parse(readFileSync(new URL('../../../package.json'), 'utf-8'))
    manifest.version = topPackageJSON.version

    if (manifest.manifest_version === 2) editManifestV2(manifest, flags, computedFlags)
    else editManifestV3(manifest)
}

function editManifestV2(manifest: any, flags: ModifyAcceptFlags, computedFlags: ComputedFlags) {
    if (String(computedFlags.sourceMapKind).includes('eval')) {
        manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; object-src 'self'; require-trusted-types-for 'script'; trusted-types default dompurify webpack mask ssr`
    }

    if (flags.hmr) {
        manifest.web_accessible_resources.push('*.json', '*.js')
    }
}

// https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
function editManifestV3(manifest: any) {}

// cspell: disable-next-line
// ID: jkoeaghipilijlahjplgbfiocjhldnap
// Note: with tihs key you cannot upload it to the extension store
function fixTheExtensionID(manifest: any) {
    manifest.key =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
