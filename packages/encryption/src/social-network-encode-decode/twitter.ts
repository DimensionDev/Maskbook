import { decodeArrayBuffer, encodeArrayBuffer } from '@dimensiondev/kit'
import { parseURL } from '@masknet/shared-base'
import { Some, None, Option } from 'ts-results'

export function __TwitterEncoder(data: Uint8Array | string) {
    if (typeof data === 'string') return __TwitterEncoderText(data)
    return __TwitterEncoderBinary(data)
}
/**
 * @link https://github.com/DimensionDev/Maskbook/issues/198
 */
function __TwitterEncoderText(text: string) {
    return `https://mask.io/?PostData_v1=${batchReplace(text, [
        ['\u{1F3BC}', '%20'],
        [':||', '%40'],
        ['+', '-'],
        ['=', '_'],
        [/\|/g, '.'],
    ])}`
}
function __TwitterEncoderBinary(data: Uint8Array) {
    return `https://mask.io/?PostData_v2=${encodeURIComponent(encodeArrayBuffer(data))}`
}

export function TwitterDecoder(raw: string): Option<string | Uint8Array> {
    const newVersion = TwitterDecoderBinary(raw)
    if (newVersion.some) return newVersion

    return TwitterDecoderText(raw)
}

function TwitterDecoderBinary(raw: string): Option<Uint8Array> {
    if (!raw) return None
    if (!raw.includes('PostData_v2')) return None

    const payloadLink = parseURL(raw).filter((x) => x.startsWith('https://mask.io/?PostData_v2='))
    try {
        for (const link of payloadLink) {
            const url = new URL(link)
            const payload = decodeURIComponent(url.searchParams.get('PostData_v2') || '')
            if (!payload) continue
            return Some(new Uint8Array(decodeArrayBuffer(payload)))
        }
    } catch {
        return None
    }
    return None
}
function TwitterDecoderText(raw: string): Option<string> {
    if (!raw) return None
    if (!raw.includes('%20') || !raw.includes('%40')) return None
    const payloadLink = parseURL(raw)
        .map((x) => x.replace(/\u2026$/, ''))
        .filter((x) => x.endsWith('%40'))[0]
    try {
        const { search, pathname } = new URL(payloadLink)
        const payload = search ? search.slice(1) : pathname.slice(1)
        if (!payload) return None
        return Some(
            `\u{1F3BC}${batchReplace(
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
