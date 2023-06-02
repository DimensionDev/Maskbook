export const EMPTY_LIST = Object.freeze([]) as never[]

export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>

export function safeEmptyList<T>(list?: T[]): T[] {
    if (!list?.length) return EMPTY_LIST
    return list
}
