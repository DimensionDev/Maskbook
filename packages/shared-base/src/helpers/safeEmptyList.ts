export function safeEmptyList<T>(list?: T[]): T[] {
    if (!list?.length) return EMPTY_LIST
    return list
}
