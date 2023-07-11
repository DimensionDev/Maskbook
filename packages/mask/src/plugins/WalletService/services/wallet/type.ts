export type { WalletRecord } from '../../../../../shared/definitions/wallet.js'

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    /**
     * The encrypted master password.
     */
    encrypted: ArrayBuffer
    /**
     * Indicate whether the default secret is used.
     *
     * true: the unsafe default secret is used.
     * false: the default secret has been overrided by the user given secret.
     */
    isUnsafe?: boolean
}
