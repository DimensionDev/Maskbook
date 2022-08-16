export type { WalletRecord } from '../../../../../shared/definitions/wallet'

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
}
