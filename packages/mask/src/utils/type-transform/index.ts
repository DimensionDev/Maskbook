export * from './asyncIteratorHelpers'
export function hasPayloadLike(text: string): boolean {
    return text.includes('\u{1F3BC}') && text.includes(':||')
}
