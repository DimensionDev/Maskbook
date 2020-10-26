import type { ProviderType } from '../../../web3/types'
import type { ChainId } from '../../../web3/types'

export interface ERC20TokenRecord {
    /** token address */
    address: string
    /** eth chain id */
    chainId: ChainId
    /** token name */
    name: string
    /** token decimal */
    decimals: number
    /** token symbol */
    symbol: string
}
//#endregion

export interface WalletRecord {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** A list of trusted ERC20 token address */
    erc20_token_whitelist: Set<string>
    /** A list of untrusted ERC20 token address */
    erc20_token_blacklist: Set<string>
    provider: ProviderType
    mnemonic: string[]
    passphrase: string
    _public_key_?: string
    /** Wallet recover from private key */
    _private_key_?: string
    createdAt: Date
    updatedAt: Date
}

export interface ERC20TokenRecordInDatabase extends ERC20TokenRecord {}

export interface WalletRecordInDatabase extends WalletRecord {}
