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
export function nonNullable<T>(x: T | false | undefined | null): x is T {
    return Boolean(x)
}
