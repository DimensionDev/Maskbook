import * as parser from /* webpackDefer: true */ 'anchorme'
export function parseURLs(text: string, requireProtocol = true) {
    // CJS-ESM compatibility
    const lib = parser.default.default || parser.default
    return lib
        .list(text)
        .map((x) => x.string)
        .filter((y) => {
            if (!requireProtocol) return true
            // See https://github.com/alexcorvi/anchorme.js/issues/109
            return URL.canParse(y)
        })
}
