export interface ExternalPluginLoadDetails {
    /** Where is the plugin hosts */
    url: string
    /** Stripped meta key that invokes this plugin */
    metaKey: string
    /** The metadata content */
    meta: unknown
}
export interface Manifest {
    manifest_version: 0
    name: string
    description?: string
    publisher: string
    metadata?: Record<string, { preview: string }>
    contribution?: Manifest_Contribution
}
export interface Manifest_Contribution {
    composition?: Manifest_Contribution_Composition
}
export interface Manifest_Contribution_Composition {
    icon?: string
    href: string
}
