export function hasPayloadLike(text: string | Uint8Array): boolean {
    if (typeof text === 'string') return text.includes('\uD83C\uDFBC') && text.includes(':||')
    return true
}
