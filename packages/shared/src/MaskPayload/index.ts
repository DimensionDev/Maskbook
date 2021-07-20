import type { ProfileIdentifier } from '../Identifier/type'

export type Payload = PayloadAlpha40_Or_Alpha39 | PayloadAlpha38
export type PayloadLatest = PayloadAlpha38

export interface PayloadAlpha40_Or_Alpha39 {
    version: -40 | -39
    ownersAESKeyEncrypted: string
    iv: string
    encryptedText: string
    signature?: string
}
export interface PayloadAlpha38 {
    version: -38
    AESKeyEncrypted: string
    iv: string
    encryptedText: string
    /** @deprecated but don't remove it cause it will break */
    signature: string
    authorPublicKey?: string
    authorUserID?: ProfileIdentifier
    sharedPublic?: boolean
}

/**
 * The string part is in the front of the payload.
 * The number part is used in the database.
 */
export enum PayloadVersions {
    '2/4' = -40,
    '3/4' = -39,
    '4/4' = -38,
}
