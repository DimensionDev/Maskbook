import type { Configuration } from 'webpack'

export function normalizeEntryDescription(entry: string | string[] | EntryDescription): EntryDescription {
    if (typeof entry === 'string') return { import: entry }
    if (Array.isArray(entry)) return { import: entry }
    return entry
}
export function joinEntryItem(x: string | string[], y: string | string[]): string[] {
    if (typeof x === 'string') return [x].concat(y)
    return x.concat(y)
}

export type EntryDescription = Exclude<
    Exclude<NonNullable<Configuration['entry']>, string | string[] | Function>[string],
    string | string[]
>
export function parseJSONc(data: string) {
    data = data
        .split('\n')
        .filter((line) => !line.trim().startsWith('//'))
        .join('\n')

    try {
        return JSON.parse(data)
    } catch (err) {
        throw new TypeError('Only // comments are supported.', { cause: err })
    }
}
