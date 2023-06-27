export type { WalletRecord } from '../../../../../shared/definitions/wallet.js'

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
}
