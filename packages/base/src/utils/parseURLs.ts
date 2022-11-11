import parser from 'anchorme'
export function parseURLs(text: string, strict = true) {
    // CJS-ESM compatibility
    const lib = parser.default || parser
    return lib
        .list(text)
        .map((x) => x.string)
        .filter((y) => {
            if (!strict) return true

            // See https://github.com/alexcorvi/anchorme.js/issues/109
            try {
                new URL(y)
                return true
            } catch {
                return false
            }
        })
}
