export function isManifest(_manifest: any): _manifest is Manifest {
    // TODO: validate with JSON schema mask-plugin-infra /packages/manifest/plugin.schema.json
    return true
}

// TODO: Those type definitions should be moved to mask-plugin-infra /packages/manifest/manifest.d.ts
export interface Manifest {
    manifest_version: 1
    id: string
    entries?: Entries
    contributes?: Contributes
    locales?: string
}
export interface Entries {
    rpc?: string
    rpcGenerator?: string
    background?: string
    content_script?: string
    popup?: string
    dashboard?: string
}
export interface Contributes {
    backup?: string
}
