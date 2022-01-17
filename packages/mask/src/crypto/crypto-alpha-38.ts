/* eslint @dimensiondev/unicode-specific-set: ["error", { "only": "code" }] */
import { TypedMessage, isTypedMessageText, type AESJsonWebKey } from '@masknet/shared-base'
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

    return JSON.stringify(obj) + '\u{1F9E9}' + x.content
}
