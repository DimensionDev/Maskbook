export type { WalletRecord } from '../../../../../shared/definitions/wallet.js'

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    /**
     * The encrypted master secret.
     */
    encrypted: ArrayBuffer
    /**
     * Indicate whether the default user password is used.
     *
     * true: the unsafe default user password is used.
     * false: the default user password is not used or has been modified by the user.
     */
    isUnsafe?: boolean
}
