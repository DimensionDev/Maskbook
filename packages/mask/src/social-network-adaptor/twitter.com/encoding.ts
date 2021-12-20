import { TwitterDecoder, __TwitterEncoder } from '@masknet/encryption'
import { isNull } from 'lodash-unified'
const ICAO9303Checksum = {
    encode: (input: string) => {
        return `${input}${(
            input
                .toUpperCase()
                .replace(/[+/=]/g, '0')
                .split('')
                .map((d, i) => Number.parseInt(d, 36) * [7, 3, 1][i % 3])
                .reduce((l, r) => l + r, 0) % 19
        )
            .toString(19)
            .toUpperCase()}`
    },
    decode: (input: string) => {
        const content = input.slice(0, input.length - 1)
        const checksum = input.slice(input.length - 1)
        const r = ICAO9303Checksum.encode(content)
        if (checksum === r.slice(r.length - 1)) {
            return content
        } else {
            return null
        }
    },
}

export const twitterEncoding = {
    /**
     * @link https://github.com/DimensionDev/Maskbook/issues/191
     */
    publicKeyEncoder: (text: string) => `🎭${ICAO9303Checksum.encode(text)}🎭`,
    publicKeyDecoder: (text: string): string[] => {
        const r = regexMatchAll(text, /([\d+/=A-Za-z]{20,60})/)
        if (isNull(r)) {
            return []
        }
        for (const v of r) {
            const retV = ICAO9303Checksum.decode(v)
            if (isNull(retV)) {
                continue
            }
            return [retV]
        }
        return []
    },
    payloadEncoder: __TwitterEncoder,
    payloadDecoder: (text: string): string[] => {
        return TwitterDecoder(text)
            .map((x) => [x])
            .unwrapOr([])
    },
}

function regexMatchAll(str: string, regexp: RegExp, index: number = 1) {
    const gPos = regexp.flags.indexOf('g')
    const withoutG = gPos >= 0 ? `${regexp.flags.slice(0, gPos)}${regexp.flags.slice(gPos + 1)}` : regexp.flags
    const o = new RegExp(regexp.source, withoutG)
    const g = new RegExp(regexp.source, `${withoutG}g`)
    const r = str.match(g)
    if (isNull(r)) {
        return null
    }
    const sto = []
    for (const v of r) {
        const retV = v.match(o)
        if (isNull(retV)) {
            continue
        }
        sto.push(retV[index])
    }
    if (sto.length === 0) {
        return null
    }
    return sto
}
