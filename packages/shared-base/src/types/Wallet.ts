import type { api } from '@dimensiondev/mask-wallet-core/proto'

export enum LockStatus {
    INIT = 0,
    UNLOCK = 1,
    LOCKED = 2,
}

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
    /** flag indicating whether the wallet is imported */
    imported?: boolean
}

export interface LegacyWalletRecord {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** A list of trusted ERC20 contract address */
    erc20_token_whitelist: Set<string>
    /** A list of untrusted ERC20 contract address */
    erc20_token_blacklist: Set<string>
    /** A list of trusted ERC721 contract address */
    erc721_token_whitelist: Set<string>
    /** A list of untrusted ERC721 contract address */
    erc721_token_blacklist: Set<string>
    /** A list of trusted ERC1155 contract address */
    erc1155_token_whitelist: Set<string>
    /** A list of untrusted ERC1155 contract address */
    erc1155_token_blacklist: Set<string>
    /** The HD wallet path includes address index */
    path?: string
    mnemonic: string[]
    passphrase: string
    _public_key_?: string
    /** Wallet recover from private key */
    _private_key_?: string
    createdAt: Date
    updatedAt: Date
}
