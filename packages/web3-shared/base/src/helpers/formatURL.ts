export function formatURL(url: string): string {
    // Step 1: Remove fragment part
    const urlWithoutFragment = url.split('#')[0]

    // Step 2: Parse the URL to get the search parameters
    const urlObj = new URL(urlWithoutFragment)
    const searchParams = urlObj.searchParams

    // Step 3: Arrange search parameters in fixed order
    const sortedSearchParams = new URLSearchParams()
    const searchParamKeys = Array.from(searchParams.keys()).sort()
    for (const key of searchParamKeys) {
        sortedSearchParams.set(key, searchParams.get(key)!)
    }

    // Step 4: Remove duplicate '//' or relative path
    const path = urlObj.pathname.replaceAll(/\/+/g, '/')

    // Step 5: Reconstruct the URL with the formatted parts
    const formattedURL = `${urlObj.origin}${path}${
        Array.from(sortedSearchParams).length ? `?${sortedSearchParams.toString()}` : ''
    }`
    return formattedURL
}
