export function createPageable<T extends unknown>(data: T[] = [], currentPage = 0, hasNextPage = false) {
    return {
        data,
        currentPage,
        hasNextPage,
    }
}
