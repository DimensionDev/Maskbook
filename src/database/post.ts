import { Identifier } from './type'

export interface PostIdentifier {
    belongsTo: Identifier
    postId: string
    // For future
    [key: string]: any
}
interface PostRecordV40 {
    identifier: PostIdentifier
    postCryptoKey: JsonWebKey
    version: -40
}
export type PostRecord = PostRecordV40
