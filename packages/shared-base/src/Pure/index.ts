export const EMPTY_LIST = Object.freeze([]) as never[]

export function safeEmptyList<T extends unknown>(list?: T[]): T[] {
    if (!list?.length) return EMPTY_LIST
    return list
}

export const EMPTY_OBJECT = Object.freeze({}) as Record<string, never>
