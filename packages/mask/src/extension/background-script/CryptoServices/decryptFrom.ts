import type { TypedMessage } from '@masknet/typed-message'

export type SuccessDecryption = {
    type: 'success'
    iv: string
    content: TypedMessage
    internal: boolean
}
export type FailureDecryption = {
    error: string
    type: 'error'
    internal: boolean
}
export type DecryptionProgress = (
    | { progress: 'finding_person_public_key' | 'finding_post_key' | 'init' | 'decode_post' }
    | { progress: 'intermediate_success'; data: SuccessDecryption }
    | { progress: 'iv_decrypted'; iv: string }
) & {
    type: 'progress'
    /** if this is true, this progress should not cause UI change. */
    internal: boolean
}
