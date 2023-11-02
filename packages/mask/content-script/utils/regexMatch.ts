import { isNull } from 'lodash-es'

/**
 * index starts at one.
 */

export function regexMatch(input: string, pattern: RegExp, index?: number): string | null
export function regexMatch(input: string, pattern: RegExp, index: null): RegExpMatchArray | null
export function regexMatch(input: string, pattern: RegExp, index: number | null = 1) {
    const r = input.match(pattern)
    if (isNull(r)) return null
    if (index === null) {
        return r as any
    }
    return r[index]
}
