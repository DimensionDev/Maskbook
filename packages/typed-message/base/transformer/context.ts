export interface TransformationContext {
    skipMaskPayloadTransform?: boolean
    authorHint?: { network: string; userId: string }
    currentProfile?: { network: string; userId: string }
    postURL?: string
    reportDecryptedInfo?(
        iv?: Uint8Array,
        claimedAuthor?: { network: string; userId: string },
        publicShared?: boolean,
    ): void
}
export function createTransformationContext(): TransformationContext {
    return Object.freeze({})
}
export const emptyTransformationContext = createTransformationContext()
