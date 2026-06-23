import type { BigNumber } from 'bignumber.js'
import type { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FungibleToken } from '@masknet/web3-shared-base'

export type TokenPair = [FungibleToken<ChainId, SchemaType>, FungibleToken<ChainId, SchemaType>]

export enum TabType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
}

export enum ProtocolType {
    Lido = 0,
    AAVE = 1,
}
export interface SavingsProtocol {
    readonly type: ProtocolType

    /**
     * combine a bare token and a staked token with being a pair
     */
    readonly pair: TokenPair

    readonly bareToken: FungibleToken<ChainId, SchemaType>
    readonly stakeToken: FungibleToken<ChainId, SchemaType>

    getApr(chainId: ChainId): Promise<string>
    getBalance(chainId: ChainId, account: string): Promise<BigNumber>

    depositEstimate(account: string, chainId: ChainId, value: BigNumber.Value): Promise<BigNumber.Value>
    deposit(account: string, chainId: ChainId, value: BigNumber.Value): Promise<string>
    withdrawEstimate(account: string, chainId: ChainId, value: BigNumber.Value): Promise<BigNumber.Value>
    withdraw(account: string, chainId: ChainId, value: BigNumber.Value): Promise<string>
}
