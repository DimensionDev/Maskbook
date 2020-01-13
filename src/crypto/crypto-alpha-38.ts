import { TypedMessage, makeTypedMessage } from '../extension/background-script/CryptoServices/utils'
export * from './crypto-alpha-39'
/**
 * With plugin: {"payload": "data"}🧩My message
 * Without plugin: My message
 */
export function typedMessageStringify(x: TypedMessage) {
    if (x.type !== 'text') throw new Error('Not supported typed message.')
    let msg = x.content
    if (x.meta) msg = JSON.stringify(x.meta) + '🧩' + msg
    return msg
}
export function typedMessageParse(x: string) {
    const [maybeMetadata, ...end] = x.split('🧩')
    try {
        const json: unknown = JSON.parse(maybeMetadata)
        if (typeof json !== 'object' || json === null || Object.keys(json).length === 0)
            throw new Error('Not a metadata')
        return makeTypedMessage(end.join('🧩'), json)
    } catch {}
    return makeTypedMessage(x)
}
