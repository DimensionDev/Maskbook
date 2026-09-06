import type { ComponentType } from 'react'

export interface DemoMeta {
    /** Display name in the nav. Defaults to the file basename. */
    title?: string
    /** Optional one-liner shown above the demo. */
    description?: string
    /** Sort weight inside a section (lower first). Defaults to 0. */
    order?: number
}

export interface DemoModule {
    default: ComponentType
    meta?: DemoMeta
}

export interface DemoEntry {
    /** e.g. "injection/twitter/Banner" */
    id: string
    /** e.g. "injection" */
    section: string
    /** e.g. "twitter", for demos nested one level under a section */
    group?: string
    /** e.g. "Banner" */
    name: string
    title: string
    description?: string
    order: number
    load: () => Promise<DemoModule>
}

export interface DemoSection {
    id: string
    title: string
    entries: DemoEntry[]
}
