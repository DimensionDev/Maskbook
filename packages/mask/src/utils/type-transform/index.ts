export * from './asyncIteratorHelpers'
export function hasPayloadLike(text: string | Uint8Array): boolean {
    if (typeof text === 'string') return text.includes('\u{1F3BC}') && text.includes(':||')
    return true
}
