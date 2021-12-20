import { parseURL } from '@masknet/shared-base'
import { Some, None, Option } from 'ts-results'

/**
 * @link https://github.com/DimensionDev/Maskbook/issues/198
 */
export function __TwitterEncoder(text: string) {
    return `https://mask.io/?PostData_v1=${batchReplace(text, [
        ['🎼', '%20'],
        [':||', '%40'],
        ['+', '-'],
        ['=', '_'],
        [/\|/g, '.'],
    ])}`
}
export function TwitterDecoder(raw: string): Option<string> {
    if (!raw) return None
    if (!raw.includes('%20') || !raw.includes('%40')) return None
    const payloadLink = parseURL(raw)
        .map((x) => x.replace(/…$/, ''))
        .filter((x) => x.endsWith('%40'))[0]
    try {
        const { search, pathname } = new URL(payloadLink)
        const payload = search ? search.slice(1) : pathname.slice(1)
        if (!payload) return None
        return Some(
            `🎼${batchReplace(
                payload
                    // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1476
                    // eslint-disable-next-line unicorn/better-regex
                    .replace(/^PostData_v\d=/i, '')
                    .replace(/^%20/, '')
                    .replace(/%40$/, ''),
                [
                    ['-', '+'],
                    ['_', '='],
                    [/\./g, '|'],
                ],
            )}:||`,
        )
    } catch {
        return None
    }
}

function batchReplace(source: string, group: Array<[string | RegExp, string]>) {
    let storage = source
    for (const v of group) {
        storage = storage.replace(v[0], v[1])
    }
    return storage
}
