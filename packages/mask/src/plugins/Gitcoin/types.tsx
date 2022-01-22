import type BigNumber from 'bignumber.js'
import type { ERC20TokenRecord } from '../Wallet/database/types'
import type { ChainId, EthereumTokenType } from '@masknet/web3-shared-evm'

export enum GitcoinGrantFailedReason {
    InvalidURL = 0,
    FetchFailed = 1,
}

// #endregion
// #region gitcoin
export interface GitcoinDonationPayload {
    donor_address: string
    donation_address: string
    donation_total: BigNumber
    chainId: ChainId
    token_type: EthereumTokenType
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}

export interface GitcoinDonationRecord {
    /** web3 network tag enum. Mainnet or Rinkeby */
    chainId: ChainId
    /** The address of donor's account */
    donor_address: string
    /** The donation transaction hash. */
    donation_transaction_hash: string
    /** The address of the project owner's account */
    donation_address: string
    /** The total donation value in Wei if ETH. In minimal unit if ERC20 token */
    donation_total: BigNumber
    /** The donation value which for project owner */
    donation_value: BigNumber
    /** token type tag for red packet */
    token_type: EthereumTokenType
    /** The tip transaction hash */
    tip_transaction_hash?: string
    /** The tip value for Gitcoin maintainer */
    tip_value?: BigNumber
    /** ERC20Token contract address if erc20 token */
    erc20_token?: string
    /** ERC20 approve transaction event value */
    erc20_approve_value?: BigNumber
    /** ERC20 approve transaction hash */
    erc20_approve_transaction_hash?: string
}

export interface DonateResult {
    donation_value: BigNumber
    donation_transaction_hash: string
    tip_value?: BigNumber
    tip_transaction_hash?: string
}
