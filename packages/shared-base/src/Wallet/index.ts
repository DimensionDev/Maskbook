import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface Wallet {
    id: string
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
    /** true: Mask Wallet, false: External Wallet */
    hasStoredKeyInfo: boolean
    /** true: Derivable Wallet. false: UnDerivable Wallet */
    hasDerivationPath: boolean
    /** yep: removable, nope: unremovable */
    configurable?: boolean
    /** the derivation path when wallet was created */
    derivationPath?: string
    /** the derivation path when wallet last was derived */
    latestDerivationPath?: string
    /** the internal presentation of mask wallet sdk */
    storedKeyInfo?: api.IStoredKeyInfo
    /** the Mask SDK stored key info */
    /** record created at */
    createdAt: Date
    /** record updated at */
    updatedAt: Date
    /** an abstract wallet has a owner */
    owner?: string
    /** an abstract wallet has been deployed */
    deployed?: boolean
    /** persona identifier */
    identifier?: string
}
