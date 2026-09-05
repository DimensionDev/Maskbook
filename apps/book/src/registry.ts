import type { DemoEntry, DemoModule, DemoSection } from './demo.ts'

const modules = import.meta.glob<DemoModule>('./demos/**/*.demo.tsx')

const SECTION_TITLES: Record<string, string> = {
    foundation: 'Foundation',
    components: 'Components',
    icons: 'Icons',
    shared: 'Shared',
}
const SECTION_ORDER = ['foundation', 'components', 'icons', 'shared']

function titleCase(input: string) {
    return input.replaceAll(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const entries: DemoEntry[] = Object.entries(modules).map(([path, load]) => {
    const match = path.match(/^\.\/demos\/([^/]+)\/(.+)\.demo\.tsx$/)
    if (!match) throw new Error(`Unexpected demo path: ${path}`)
    const [, section, name] = match
    return {
        id: `${section}/${name}`,
        section,
        name,
        title: name,
        order: 0,
        load: async () => {
            const mod = await load()
            return mod
        },
    }
})

export const sections: DemoSection[] = (() => {
    const bySection = new Map<string, DemoEntry[]>()
    for (const entry of entries) {
        const list = bySection.get(entry.section) ?? []
        list.push(entry)
        bySection.set(entry.section, list)
    }
    const orderOf = (id: string) => {
        const i = SECTION_ORDER.indexOf(id)
        return i === -1 ? SECTION_ORDER.length : i
    }
    return [...bySection.entries()]
        .sort(([a], [b]) => orderOf(a) - orderOf(b) || a.localeCompare(b))
        .map(([id, list]) => ({
            id,
            title: SECTION_TITLES[id] ?? titleCase(id),
            entries: list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
        }))
})()

export const allEntries: DemoEntry[] = sections.flatMap((s) => s.entries)

export function findEntry(id: string | undefined): DemoEntry | undefined {
    if (!id) return undefined
    return allEntries.find((e) => e.id === id)
}
