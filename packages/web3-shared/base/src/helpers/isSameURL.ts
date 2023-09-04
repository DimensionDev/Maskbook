export function isSameURL(a: string | URL | undefined, b: string | URL | undefined): boolean {
    if (!a || !b) return false

    // If either URL is invalid, return false
    if (typeof a === 'string' && !URL.canParse(a)) return false
    if (typeof b === 'string' && !URL.canParse(b)) return false

    // Parse the input URLs if they are strings
    const urlA = typeof a === 'string' ? new URL(a) : a
    const urlB = typeof b === 'string' ? new URL(b) : b

    // Compare the important parts of the URLs
    if (urlA.protocol !== urlB.protocol || urlA.hostname !== urlB.hostname || urlA.pathname !== urlB.pathname) {
        return false
    }

    // Compare the search parameters in a case-insensitive way
    const paramsA = new URLSearchParams(urlA.search)
    const paramsB = new URLSearchParams(urlB.search)

    // Compare the search parameters, allowing different sequence but same values
    for (const [paramA, valueA] of paramsA.entries()) {
        const valueB = paramsB.get(paramA)
        if (valueA !== valueB) {
            return false
        }
    }

    // Check if all the parameters in B are also in A
    for (const [paramB] of paramsB.entries()) {
        if (!paramsA.has(paramB)) {
            return false
        }
    }

    return true
}
