// Note: this package is published as is, therefore we cannot ship the syntax nor change the module target.
// eslint-disable-next-line @masknet/prefer-defer-import
import * as parser from /* webpackDefer: true */ 'anchorme'
export function parseURLs(text: string, requireProtocol = true): string[] {
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
