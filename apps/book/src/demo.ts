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
    /** e.g. "components/ActionButton" */
    id: string
    /** e.g. "components" */
    section: string
    /** e.g. "ActionButton" */
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
