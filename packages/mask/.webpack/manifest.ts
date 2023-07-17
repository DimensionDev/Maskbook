/* spell-checker: disable */
import emitFile from '@nice-labs/emit-file-webpack-plugin'
import type { ComputedFlags, NormalizedFlags } from './flags.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Manifest } from 'webextension-polyfill'
import { parseJSONc } from './utils.js'
import { join } from 'node:path'

const cloneDeep = <T>(x: T): T => JSON.parse(JSON.stringify(x))

export function emitManifestFile(flags: NormalizedFlags, computedFlags: ComputedFlags) {
    const manifest = prepareAllManifest(flags, computedFlags)
    const plugins = []
    for (const [fileName, fileContent] of manifest) {
        plugins.push(
            emitFile.emitJSONFile({
                name: `manifest-${fileName}.json`,
                content: fileContent,
            }),
        )
    }
    if (flags.mode === 'development') {
        if (!existsSync(flags.outputPath)) mkdirSync(flags.outputPath, { recursive: true })
        // Note: this is to optimize the DX of the following case:
        // change manifest.json within all the targets we support.
        // if we use emitFile plugin here, manifest.json will be overwritten by the plugin once _any_ new file is emitted,
        // which is annoying when debugging in this case.
        writeFileSync(
            join(flags.outputPath, 'manifest.json'),
            JSON.stringify(manifest.get(flags.mainManifestFile)!, undefined, 4),
        )
    } else {
        plugins.push(
            emitFile.emitJSONFile({
                name: `manifest.json`,
                content: manifest.get(flags.mainManifestFile)!,
            }),
        )
    }
    return plugins
}

type ManifestV2 = Manifest.WebExtensionManifest & { manifest_version: 2; key?: string }
type ManifestV3 = Manifest.WebExtensionManifest & { manifest_version: 3; key?: string }
type ModifyAcceptFlags = Pick<NormalizedFlags, 'mode' | 'channel' | 'devtools' | 'hmr'>
type ManifestPresets =
    | [flags: ModifyAcceptFlags, base: ManifestV2, modify?: (manifest: ManifestV2) => void]
    | [flags: ModifyAcceptFlags, base: ManifestV3, modify?: (manifest: ManifestV3) => void]
function prepareAllManifest(flags: NormalizedFlags, computedFlags: ComputedFlags) {
    const mv2Base: ManifestV2 = parseJSONc(readFileSync(new URL('./manifest/manifest.json', import.meta.url), 'utf-8'))
    const mv3Base: ManifestV3 = parseJSONc(
        readFileSync(new URL('./manifest/manifest-mv3.json', import.meta.url), 'utf-8'),
    )

    const manifestFlags: Record<NormalizedFlags['mainManifestFile'], ManifestPresets> = {
        'chromium-mv2': [flags, mv2Base],
        'chromium-mv3': [flags, mv3Base],
        'firefox-mv2': [flags, mv2Base, (manifest: ManifestV2) => manifest.permissions!.push('tabs')],
        'firefox-mv3': [
            flags,
            mv3Base,
            (manifest: ManifestV3) => {
                manifest.host_permissions = (manifest as any).optional_host_permissions
                manifest.background = { page: 'background.html' }
            },
        ],
        'safari-mv3': [flags, mv3Base],
    }
    const manifest = new Map<NormalizedFlags['mainManifestFile'], ManifestV2 | ManifestV3>()
    for (const fileName in manifestFlags) {
        if (!Object.hasOwn(manifestFlags, fileName)) continue
        const [flags, base, modify]: ManifestPresets = (manifestFlags as any)[fileName]
        const fileContent = cloneDeep(base)
        editManifest(fileContent, cloneDeep(flags), cloneDeep(computedFlags))
        modify?.(fileContent as any)
        manifest.set(fileName as any, fileContent)
    }
    return manifest
}

function editManifest(manifest: ManifestV2 | ManifestV3, flags: ModifyAcceptFlags, computedFlags: ComputedFlags) {
    if (flags.mode === 'development') manifest.name += ' (dev)'
    else if (flags.channel === 'beta') manifest.name += ' (beta)'
    else if (flags.channel === 'insider') manifest.name += ' (insider)'

    if (flags.mode === 'development') fixTheExtensionID(manifest)
    if (flags.mode === 'production' && flags.channel !== 'stable') fixTheExtensionID(manifest)
    if (flags.devtools) manifest.devtools_page = 'devtools-background.html'

    const topPackageJSON = JSON.parse(readFileSync(new URL('../../../package.json', import.meta.url), 'utf-8'))
    manifest.version = topPackageJSON.version

    if (manifest.manifest_version === 2) {
        if (String(computedFlags.sourceMapKind).includes('eval')) {
            manifest.content_security_policy = `script-src 'self' 'unsafe-eval'; object-src 'self'; require-trusted-types-for 'script'; trusted-types default dompurify webpack mask ssr`
        }

        if (flags.hmr) {
            ;(manifest.web_accessible_resources as string[]).push('*.json', '*.js')
        }
    } else {
        // https://developer.chrome.com/docs/extensions/mv3/intro/mv3-migration/
    }
}

// cspell: disable-next-line
// ID: jkoeaghipilijlahjplgbfiocjhldnap
// Note: with tihs key you cannot upload it to the extension store
function fixTheExtensionID(manifest: ManifestV2 | ManifestV3) {
    manifest.key =
        'MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAoz51rhO1w+wD' +
        '0EKZJEFJaSMkIcIj0qRadfi0tqcl5nbpuJAsafvLe3MaTbW9LhbixTg9' +
        'PHybO3tlYUFJrZgUuZlEvt2T6SKIu6Rs9e9B3/brNQG3+hCHudbZkq2W' +
        'G2IzO44dglrs24bRp/pV5oIif0bLuwrzvYsPQ6hgSp+5gc4pg0LEJPLF' +
        'p01fbORDknWt8suJmEMz7S0O5+u13+34NvxYzUNeLJF9gYrd4zzrAFYI' +
        'TDEYcqr0OMZvVrKz7IkJasER1uJyoGj4gFJeXNGE8y4Sqb150wBju70l' +
        'KNKlNevWDRJKasG9CjagAD2+BAfqNyltn7KwK7jAyL1w6d6mOwIDAQAB'
}
