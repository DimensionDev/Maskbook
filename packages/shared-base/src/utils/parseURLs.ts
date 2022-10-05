import parser from 'anchorme'
export function parseURLs(text: string) {
    const lib = parser.default || parser
    // CJS-ESM compatibility
    return lib
        .list(text)
        .map((x) => x.string)
        .filter((y) => {
            // See https://github.com/alexcorvi/anchorme.js/issues/109
            try {
                new URL(y)
                return true
            } catch {
                return false
            }
        })
}
