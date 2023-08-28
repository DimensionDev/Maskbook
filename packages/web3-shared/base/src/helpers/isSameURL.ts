export function isSameURL(a: string | URL | undefined, b: string | URL | undefined): boolean {
    if (!a || !b) return false

    // Parse the input URLs if they are strings
    let urlA: URL
    let urlB: URL

    try {
        urlA = typeof a === 'string' ? new URL(a) : a
        urlB = typeof b === 'string' ? new URL(b) : b
    } catch (error) {
        // If either URL is invalid, return false
        return false
    }

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
