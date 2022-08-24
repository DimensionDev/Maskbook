// TODO: This file should be moved to another repo as the public API when the design is stable enough.

export function isManifest(manifest: any): manifest is PluginManifest {
    if (typeof manifest !== 'object' || !manifest) return false
    if (typeof manifest.id !== 'string') return false
    if (typeof manifest.entries === 'object' && manifest.entries) {
        for (const value of Object.values(manifest.entries)) {
            if (typeof value !== 'string') return false
        }
    }
    return true
}
export interface PluginEntries {
    rpc?: string
    background?: string
    content_script?: string
    popup?: string
    dashboard?: string
}
export interface PluginManifest {
    entries?: PluginEntries
    id: string
}
