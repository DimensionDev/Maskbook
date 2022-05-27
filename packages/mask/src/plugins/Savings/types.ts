import type Web3 from 'web3'
import type BigNumber from 'bignumber.js'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

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
     * annual percentage rate
     */
    readonly apr: string

    /**
     * the amount of staked tokens of the latest found account
     */
    readonly balance: BigNumber

    /**
     * combine a bare token and a staked token with being a pair
     */
    readonly pair: [FungibleTokenDetailed, FungibleTokenDetailed]

    readonly bareToken: FungibleTokenDetailed
    readonly stakeToken: FungibleTokenDetailed

    updateApr(chainId: ChainId, web3: Web3): Promise<void>
    updateBalance(chainId: ChainId, web3: Web3, account: string): Promise<void>

    depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<BigNumber.Value>
    deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<string>
    withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<BigNumber.Value>
    withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<string>
}
