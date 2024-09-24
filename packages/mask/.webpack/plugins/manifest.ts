/* spell-checker: disable */
import emitFile from '@nice-labs/emit-file-webpack-plugin'
import type { ComputedFlags, NormalizedFlags } from '../flags.js'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import type { Manifest } from 'webextension-polyfill'
import { parseJSONc } from '../utils.js'
import { join } from 'node:path'

const cloneDeep = <T>(x: T): T => JSON.parse(JSON.stringify(x))

const CSPKeyword = ['none', 'self', 'unsafe-inline']
export function emitManifestFile(flags: NormalizedFlags, computedFlags: ComputedFlags) {
    const data = parseJSONc(
        readFileSync(new URL('../../../../security/content-security-policy.json', import.meta.url), 'utf-8'),
    )
    const cspContent = {
        mv2: Array.from(data['@mv2']).join('; ') + '; ',
        mv2dev: Array.from(data['@mv2dev']).join('; ') + '; ',
        mv3: Array.from(data['@mv3']).join('; ') + '; ',
    }
    if (flags.csp && flags.mode === 'development') {
        let csp = ''
        for (const key in data) {
            if (key.startsWith('@')) continue
            const val = data[key]
            csp += `${key} `
            if (CSPKeyword.includes(val)) csp += `'${val}'`
            else if (Array.isArray(val)) {
                csp += val
                    .map((val) => {
                        if (val.startsWith('@dev-only:')) {
                            if (flags.mode === 'development') val = val.slice('@dev-only:'.length)
                            else return ''
                        }
                        if (CSPKeyword.includes(val)) return `'${val}'`
                        return val
                    })
                    .filter(Boolean)
                    .join(' ')
            } else csp += val
            csp += '; '
        }
        csp.trim()
        cspContent.mv2 += csp
        cspContent.mv2dev += csp
        cspContent.mv3 += csp
    }

    const manifest = prepareAllManifest(flags, computedFlags, cspContent)
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
            JSON.stringify(manifest.get(flags.manifestFile)!, undefined, 4),
        )
    } else {
        plugins.push(
            emitFile.emitJSONFile({
                name: `manifest.json`,
                content: manifest.get(flags.manifestFile)!,
            }),
        )
    }
    return plugins
}

type ManifestV2 = Manifest.WebExtensionManifest & { manifest_version: 2; key?: string }
type ManifestV3 = Manifest.WebExtensionManifest & { manifest_version: 3; key?: string }
type ModifyAcceptFlags = Pick<NormalizedFlags, 'mode' | 'channel' | 'devtools' | 'hmr'>
type CSP = {
    mv2: string
    mv2dev: string
    mv3: string
}
type ManifestPresets =
    | [flags: ModifyAcceptFlags, base: ManifestV2, modify?: (manifest: ManifestV2) => void]
    | [flags: ModifyAcceptFlags, base: ManifestV3, modify?: (manifest: ManifestV3) => void]

function prepareAllManifest(flags: NormalizedFlags, computedFlags: ComputedFlags, csp: CSP) {
    const mv2Base: ManifestV2 = parseJSONc(readFileSync(new URL('../manifest/manifest.json', import.meta.url), 'utf-8'))
    const mv3Base: ManifestV3 = parseJSONc(
        readFileSync(new URL('../manifest/manifest-mv3.json', import.meta.url), 'utf-8'),
    )

    const manifestFlags: Record<NormalizedFlags['manifestFile'], ManifestPresets> = {
        'chromium-beta-mv3': [{ ...flags, channel: 'beta' }, mv3Base],
        'chromium-mv2': [flags, mv2Base, (manifest: ManifestV2) => (manifest.browser_specific_settings = undefined)],
        'chromium-mv3': [flags, mv3Base, (manifest: ManifestV3) => (manifest.browser_specific_settings = undefined)],
        'firefox-mv2': [flags, mv2Base, (manifest: ManifestV2) => manifest.permissions!.push('tabs')],
        'firefox-mv3': [
            flags,
            mv3Base,
            (manifest: ManifestV3) => {
                manifest.host_permissions = (manifest as any).optional_host_permissions
                delete (manifest as any).optional_host_permissions
                manifest.background = { page: 'background.html' }
                manifest.web_accessible_resources?.forEach(
                    (x) => typeof x === 'object' && delete (x as any).use_dynamic_url,
                )
                delete manifest.key
            },
        ],
        'safari-mv3': [
            flags,
            mv3Base,
            (manifest: ManifestV3) => {
                manifest.host_permissions = (manifest as any).optional_host_permissions
                delete (manifest as any).optional_host_permissions
                delete manifest.key
            },
        ],
    }
    const manifest = new Map<NormalizedFlags['manifestFile'], ManifestV2 | ManifestV3>()
    for (const fileName in manifestFlags) {
        if (!Object.hasOwn(manifestFlags, fileName)) continue
        const [flags, base, modify]: ManifestPresets = (manifestFlags as any)[fileName]
        const fileContent = cloneDeep(base)
        editManifest(fileContent, cloneDeep(flags), cloneDeep(computedFlags), csp)
        modify?.(fileContent as any)
        manifest.set(fileName as any, fileContent)
    }
    return manifest
}

function editManifest(
    manifest: ManifestV2 | ManifestV3,
    flags: ModifyAcceptFlags,
    computedFlags: ComputedFlags,
    csp: CSP,
) {
    if (flags.mode === 'development') manifest.name += ' (dev)'
    else if (flags.channel === 'beta') manifest.name += ' (beta)'
    else if (flags.channel === 'insider') manifest.name += ' (insider)'

    fixTheExtensionID(manifest)
    if (flags.devtools) manifest.devtools_page = 'devtools-background.html'

    const topPackageJSON = JSON.parse(readFileSync(new URL('../../../../package.json', import.meta.url), 'utf-8'))
    manifest.version = topPackageJSON.version

    if (manifest.manifest_version === 2) {
        if (String(computedFlags.sourceMapKind).includes('eval')) manifest.content_security_policy = csp.mv2dev
        else manifest.content_security_policy = csp.mv2

        if (flags.hmr) {
            ;(manifest.web_accessible_resources as string[]).push('*.json', '*.js')
        }
    } else {
        manifest.content_security_policy = { extension_pages: csp.mv3 }
    }
}

// cspell: disable-next-line
// Note: with this key you cannot upload it to the extension store
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
