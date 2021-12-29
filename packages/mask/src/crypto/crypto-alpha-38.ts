import { TypedMessage, makeTypedMessageText, isTypedMessageText, type AESJsonWebKey } from '@masknet/shared-base'
export * from './crypto-alpha-39'

// @ts-ignore
export const publicSharedAESKey: AESJsonWebKey = {
    alg: 'A256GCM',
    ext: true,
    /* cspell:disable-next-line */
    k: '3Bf8BJ3ZPSMUM2jg2ThODeLuRRD_-_iwQEaeLdcQXpg',
    key_ops: ['encrypt', 'decrypt'],
    kty: 'oct',
}
/**
 * With plugin: {"payload": "data"}🧩My message
 * Without plugin: My message
 */
export function typedMessageStringify(x: TypedMessage) {
    if (!isTypedMessageText(x)) throw new Error('Not supported typed message.')
    if (!x.meta || x.meta.size === 0) return x.content

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
        return makeTypedMessageText(end.join('🧩'), new Map(Object.entries(json)))
    } catch {}
    return makeTypedMessageText(x)
}
