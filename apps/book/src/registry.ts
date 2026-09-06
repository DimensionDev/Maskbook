import type { DemoEntry, DemoModule, DemoSection } from './demo.ts'

const modules = import.meta.glob<DemoModule>('./demos/**/*.demo.tsx')

const SECTION_TITLES: Record<string, string> = {
    foundation: 'Foundation',
    components: 'Components',
    icons: 'Icons',
    shared: 'Shared',
    injection: 'Injection',
    popups: 'Popups',
}
const SECTION_ORDER = ['foundation', 'components', 'icons', 'injection', 'popups', 'shared']

// Display names for the platform sub-folders under demos/injection/<platform>/.
const GROUP_TITLES: Record<string, string> = {
    twitter: 'X (Twitter)',
    facebook: 'Facebook',
    instagram: 'Instagram',
    minds: 'Minds',
}
const GROUP_ORDER = ['twitter', 'facebook', 'instagram', 'minds', 'shared']

function titleCase(input: string) {
    return input.replaceAll(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

const entries: DemoEntry[] = Object.entries(modules).map(([path, load]) => {
    // demos/<section>/<name>.demo.tsx, or demos/<section>/<group>/<name>.demo.tsx for a
    // section with sub-categories (e.g. injection/twitter/Banner).
    const match = path.match(/^\.\/demos\/([^/]+)\/(?:([^/]+)\/)?([^/]+)\.demo\.tsx$/)
    if (!match) throw new Error(`Unexpected demo path: ${path}`)
    const [, section, group, name] = match
    return {
        id: group ? `${section}/${group}/${name}` : `${section}/${name}`,
        section,
        group,
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
    const groupOrderOf = (group: string | undefined) => {
        if (!group) return -1
        const i = GROUP_ORDER.indexOf(group)
        return i === -1 ? GROUP_ORDER.length : i
    }
    return [...bySection.entries()]
        .sort(([a], [b]) => orderOf(a) - orderOf(b) || a.localeCompare(b))
        .map(([id, list]) => ({
            id,
            title: SECTION_TITLES[id] ?? titleCase(id),
            entries: list.sort(
                (a, b) =>
                    groupOrderOf(a.group) - groupOrderOf(b.group) ||
                    (a.group ?? '').localeCompare(b.group ?? '') ||
                    a.order - b.order ||
                    a.name.localeCompare(b.name),
            ),
        }))
})()

export function groupTitle(group: string): string {
    return GROUP_TITLES[group] ?? titleCase(group)
}

export const allEntries: DemoEntry[] = sections.flatMap((s) => s.entries)

export function findEntry(id: string | undefined): DemoEntry | undefined {
    if (!id) return undefined
    return allEntries.find((e) => e.id === id)
}
