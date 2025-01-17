import { EncryptPayloadNetwork } from '../payload/types.js'
import { sharedDecoder, sharedEncoder } from './shared.js'
import { TwitterDecoder, __TwitterEncoder } from './twitter.js'

export function decodeByNetwork(network: EncryptPayloadNetwork, content: string): Array<string | Uint8Array> {
    const payloads: Array<string | Uint8Array> = []
    if (network === EncryptPayloadNetwork.Twitter) {
        const data = TwitterDecoder(content)
        if (data.isSome()) payloads.push(data.value)
    }

    if (!payloads.length) {
        const _possiblePayload = content.match(/(\u{1F3BC}[\w+/=|]+:\|\|)/giu) || []

        for (const payload of _possiblePayload) {
            const decoded = sharedDecoder(payload)
            if (decoded.isSome()) payloads.push(decoded.value)
            else payloads.push(payload)
        }
    }
    return payloads
}
export function encodeByNetwork(
    network: EncryptPayloadNetwork,
    target: 'text' | 'image',
    content: string | Uint8Array,
): string {
    // v38
    if (typeof content === 'string') {
        if (target === 'image') return content
        if (network === EncryptPayloadNetwork.Twitter) return __TwitterEncoder(content)
        return content
    }

    // v37
    if (network === EncryptPayloadNetwork.Twitter) return __TwitterEncoder(content)
    return sharedEncoder(content)
}

export * from './twitter.js'
