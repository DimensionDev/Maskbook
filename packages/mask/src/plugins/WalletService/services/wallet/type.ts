export type { WalletRecord } from '../../../../../shared/definitions/wallet.js'

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
    /**
     * Indicate the type of secret is using.
     *
     * true: the default secret has been overrided by the user given secret.
     * false: the unsafe default secret is using.
     */
    hasUpdatedByUser?: boolean
}
