import { encodeArrayBuffer, decodeText, decodeArrayBuffer, encodeText } from '@masknet/kit'
import type { AESCryptoKey } from '@masknet/shared-base'

// * Payload format: 🎶2/4|encrypted_comment:||
// * Payload format: 🎶3/4|iv|encrypted_comment:||
export async function encryptComment(
    postIV: Uint8Array<ArrayBuffer>,
    postContent: string,
    comment: string,
): Promise<string> {
    const key = await getCommentKey(postIV, postContent)
    const commentIV = crypto.getRandomValues(new Uint8Array(16))

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: commentIV }, key, encodeText(comment))
    return `\u{1F3B6}3/4|${encodeArrayBuffer(commentIV)}|${encodeArrayBuffer(encrypted)}:||`
}
export async function decryptComment(
    postIV: Uint8Array<ArrayBuffer>,
    postContent: string,
    encryptComment: string,
): Promise<string | null> {
    const payload = extractCommentPayload(encryptComment)
    if (!payload) return null

    const key = await getCommentKey(postIV, postContent)
    const result = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: payload[0] || postIV },
        key,
        decodeArrayBuffer(payload[1]),
    )
    return decodeText(result)
}

async function getCommentKey(postIV: Uint8Array<ArrayBuffer>, postContent: string) {
    const pbkdf = await crypto.subtle.importKey('raw', encodeText(postContent), 'PBKDF2', false, [
        'deriveBits',
        'deriveKey',
    ])
    return (await crypto.subtle.deriveKey(
        { name: 'PBKDF2', salt: postIV, iterations: 100000, hash: 'SHA-256' },
        pbkdf,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt'],
    )) as AESCryptoKey
}

function extractCommentPayload(text: string): [iv: undefined | Uint8Array<ArrayBuffer>, encrypted: string] | null {
    const version2Header = text.indexOf('\u{1F3B6}3/4|')
    const version1Header = text.indexOf('\u{1F3B6}2/4|')
    if (version2Header === -1 && version1Header === -1) return null
    const untilEnd = text.slice(version2Header !== -1 ? version2Header : version1Header).split(':||')
    if (untilEnd.length === 0) return null
    if (version1Header !== -1) return [undefined, untilEnd[0].slice('\u{1F3B6}2/4|'.length)]
    const fields = untilEnd[0].split('|')
    if (fields.length !== 3) return null
    return [new Uint8Array(decodeArrayBuffer(fields[1])), fields[2]]
}
