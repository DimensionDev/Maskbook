import type { Wallet } from '@masknet/web3-shared-evm'
import type { api } from '@dimensiondev/mask-wallet-core/proto'
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
export interface WalletRecord extends Omit<Wallet, 'configurable' | 'hasStoredKeyInfo' | 'hasDerivationPath'> {
    id: string
    type: 'wallet'
    derivationPath?: string
    latestDerivationPath?: string
    storedKeyInfo?: api.IStoredKeyInfo
    createdAt: Date
    updatedAt: Date
}
