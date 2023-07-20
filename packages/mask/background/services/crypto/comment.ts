import { encodeArrayBuffer, decodeText, decodeArrayBuffer, encodeText } from '@masknet/kit'
import type { AESCryptoKey } from '@masknet/shared-base'

// * Payload format: 🎶2/4|encrypted_comment:||
export async function encryptComment(postIV: Uint8Array, postContent: string, comment: string): Promise<string> {
    const key = await getCommentKey(postIV, postContent)

    const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: postIV }, key, encodeText(comment))
    return `\u{1F3B6}2/4|${encodeArrayBuffer(encrypted)}:||`
}
export async function decryptComment(
    postIV: Uint8Array,
    postContent: string,
    encryptComment: string,
): Promise<string | null> {
    const payload = extractCommentPayload(encryptComment)
    if (!payload) return null

    const key = await getCommentKey(postIV, postContent)
    const result = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: postIV }, key, decodeArrayBuffer(payload))
    return decodeText(result)
}

async function getCommentKey(postIV: Uint8Array, postContent: string) {
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

function extractCommentPayload(text: string) {
    const [_, toEnd] = text.split('\u{1F3B6}2/4|')
    const [content, _2] = (toEnd || '').split(':||')
    if (content.length) return content
    return
}
