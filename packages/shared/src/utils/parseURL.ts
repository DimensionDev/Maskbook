import parser from 'anchorme'
export function parseURL(string: string) {
    return parser.list(string).map((x) => x.string)
}
