import type BigNumber from 'bignumber.js'
import type Web3 from 'web3'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface SavingsNetwork {
    chainId: ChainId
    chainName: string
}

export enum ProtocolCategory {
    ETH = 'eth',
}

export enum ProtocolType {
    Lido = 0,
}

export interface SavingsProtocol {
    category: ProtocolCategory
    type: ProtocolType
    name: string
    image: string
    base: string
    pair: string
    availableNetworks: SavingsNetwork[]
    apr: string
    balance: string

    getApr(): Promise<string>
    getBalance(chainId: ChainId, web3: Web3, account: string): Promise<string>
    depositEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<BigNumber.Value>
    deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<boolean>
    withdrawEstimate(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<BigNumber.Value>
    withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber.Value): Promise<boolean>
}

export enum TabType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
}
