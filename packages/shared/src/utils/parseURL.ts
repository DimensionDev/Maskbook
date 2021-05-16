import parser from 'anchorme'
export function parseURL(text: string) {
    return parser
        .list(text)
        .map((x) => x.string)
        .filter((y) => {
            try {
                new URL(y)
                return true
            } catch {
                return false
            }
        })
}
