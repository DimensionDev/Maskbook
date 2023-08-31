import { EncryptPayloadNetwork } from '../payload/types.js'
import { sharedDecoder, sharedEncoder } from './shared.js'
import { TwitterDecoder, __TwitterEncoder } from './twitter.js'

export function decodeByNetwork(network: EncryptPayloadNetwork, content: string): Array<string | Uint8Array> {
    if (network === EncryptPayloadNetwork.Twitter) {
        return TwitterDecoder(content)
            .map((x) => [x])
            .unwrapOr([])
    }
    const possiblePayload = content.match(/(\u{1F3BC}[\w+/=|]+:\|\|)/giu) || []

    const result: Array<string | Uint8Array> = []
    for (const payload of possiblePayload) {
        const decoded = sharedDecoder(payload)
        if (decoded.isSome()) result.push(decoded.value)
        else result.push(payload)
    }
    return result
}
export function encodeByNetwork(network: EncryptPayloadNetwork, content: string | Uint8Array): string {
    // v38
    if (typeof content === 'string') {
        if (network === EncryptPayloadNetwork.Twitter) return __TwitterEncoder(content)
        return content
    }

    // v37
    if (network === EncryptPayloadNetwork.Twitter) return __TwitterEncoder(content)
    return sharedEncoder(content)
}

export * from './twitter.js'
