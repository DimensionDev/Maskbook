import parser from 'anchorme'
export function parseURL(text: string) {
    return parser
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
