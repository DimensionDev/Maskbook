import type { api } from '@dimensiondev/mask-wallet-core/proto'

export interface Wallet {
    /** User define wallet name. Default address.prefix(6) */
    name: string
    /** The address of wallet */
    address: string
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
    /** yep: Mask Wallet, nope: External Wallet */
    hasStoredKeyInfo: boolean
    /** yep: Derivable Wallet. nope: UnDerivable Wallet */
    hasDerivationPath: boolean
}

export interface WalletRecord extends Omit<Wallet, 'hasStoredKeyInfo' | 'hasDerivationPath'> {
    id: string
    type: 'wallet'
    derivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}

export interface SecretRecord {
    id: string
    type: 'secret'
    iv: ArrayBuffer
    key: ArrayBuffer
    encrypted: ArrayBuffer
}
