import type { BigNumber } from 'bignumber.js'
import type { ProviderType } from '../../../web3/types'
import type { ChainId } from '../../../web3/types'

export interface ERC20TokenRecordInDatabase extends ERC20TokenRecord {}

export interface WalletRecordInDatabase extends Omit<WalletRecord, 'eth_balance' | 'erc20_token_balance'> {
    eth_balance: string | bigint
    erc20_token_balance: Map<string, string | bigint>
}

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
    /** Yes if user added token */
    is_user_defined: boolean
}
//#endregion

//#region wallet
export interface WalletRecordProperties {
    /** ethereum hex address */
    address: string
    /** User define wallet name. Default address.prefix(6) */
    name: string | null
    /** Wallet ethereum balance */
    eth_balance: BigNumber
    erc20_token_balance: Map</** address of the erc20 token */ string, BigNumber>
    erc20_token_whitelist: Set<string>
    erc20_token_blacklist: Set<string>
    _wallet_is_default?: boolean
    createdAt: Date
    updatedAt: Date
}

export interface WalletRecord extends WalletRecordProperties {
    provider: ProviderType
    mnemonic: string[]
    passphrase: string
    _public_key_?: string
    /** Wallet recover from private key */
    _private_key_?: string
}
