import { TypedMessage, makeTypedMessage } from '../extension/background-script/CryptoServices/utils'
export * from './crypto-alpha-39'
/**
 * With plugin: {"payload": "data"}🧩My message
 * Without plugin: My message
 */
export function typedMessageStringify(x: TypedMessage) {
    if (x.type !== 'text') throw new Error('Not supported typed message.')
    if (!x.meta) return x.content

    const obj: Record<string, any> = {}
    for (const [a, b] of x.meta) obj[a] = b

    return JSON.stringify(obj) + '🧩' + x.content
}
export function typedMessageParse(x: string) {
    const [maybeMetadata, ...end] = x.split('🧩')
    try {
        const json: unknown = JSON.parse(maybeMetadata)
        if (typeof json !== 'object' || json === null || Object.keys(json).length === 0)
            throw new Error('Not a metadata')
        return makeTypedMessage(end.join('🧩'), new Map(Object.entries(json)))
    } catch {}
    return makeTypedMessage(x)
}
