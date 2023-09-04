import { decodeArrayBuffer, encodeArrayBuffer } from '@masknet/kit'
import { parseURLs } from '@masknet/base'
import { Some, None, type Option } from 'ts-results-es'

export function __TwitterEncoder(data: Uint8Array | string) {
    if (typeof data === 'string') return __TwitterEncoderText(data)
    return __TwitterEncoderBinary(data)
}
/**
 * @link https://github.com/DimensionDev/Maskbook/issues/198
 */
function __TwitterEncoderText(text: string) {
    return (
        'https://mask.io/?PostData_v1=' +
        text
            //
            .replace('\u{1F3BC}', '%20')
            .replace(':||', '%40')
            .replace('+', '-')
            .replace('=', '_')
            .replaceAll('|', '.')
    )
}
function __TwitterEncoderBinary(data: Uint8Array) {
    return `https://mask.io/?PostData_v2=${encodeURIComponent(encodeArrayBuffer(data))}`
}

export function TwitterDecoder(raw: string): Option<string | Uint8Array> {
    const newVersion = TwitterDecoderBinary(raw)
    if (newVersion.isSome()) return newVersion

    return TwitterDecoderText(raw)
}

function TwitterDecoderBinary(raw: string): Option<Uint8Array> {
    if (!raw) return None
    if (!raw.includes('PostData_v2')) return None

    const payloadLink = parseURLs(raw).filter((x) => x.startsWith('https://mask.io/?PostData_v2='))
    try {
        for (const link of payloadLink) {
            const url = new URL(link)
            const payload = url.searchParams.get('PostData_v2')
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
    const payloadLink = parseURLs(raw)
        .map((x) => x.replace(/\u2026$/, ''))
        .filter((x) => x.endsWith('%40'))[0]
    if (!URL.canParse(payloadLink)) return None
    const { search, pathname } = new URL(payloadLink)
    const payload = search ? search.slice(1) : pathname.slice(1)
    if (!payload) return None
    return Some(
        '\u{1F3BC}' +
            payload
                // https://github.com/sindresorhus/eslint-plugin-unicorn/issues/1476
                // eslint-disable-next-line unicorn/better-regex
                .replace(/^PostData_v\d=/i, '')
                .replace(/^%20/, '')
                .replace(/%40$/, '')
                .replace('-', '+')
                .replace('_', '=')
                .replaceAll('.', '|') +
            ':||',
    )
}
