import type BigNumber from 'bignumber.js'
import type Web3 from 'web3'
import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared-evm'

export interface SavingsNetwork {
    chainId: ChainId
    chainName: string
    contractAddress: string
}

export enum ProtocolCategory {
    ETH = 'eth',
}

export enum ProtocolType {
    Lido = 0,
    Convex = 1,
}

export interface SavingsProtocol {
    category: ProtocolCategory
    type: ProtocolType
    name: string
    image: string
    bareToken: string
    stakingToken: string
    decimals: number
    availableNetworks: SavingsNetwork[]
    apr: string
    balance: BigNumber

    getFungibleTokenDetails(chainId: ChainId): FungibleTokenDetailed
    getApr(): Promise<string>
    getBalance(chainId: ChainId, web3: Web3, account: string): Promise<BigNumber.Value>
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
    deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<boolean>
    withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<BigNumber.Value>
    withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<boolean>
}

export enum TabType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
}
