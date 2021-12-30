import type BigNumber from 'bignumber.js'
import type Web3 from 'web3'
import type { Contract } from 'web3-eth-contract'
import type { ChainId } from '@masknet/web3-shared-evm'

export interface SavingsNetwork {
    chainId: ChainId
    chainName: string
}

export interface SavingsProtocol {
    id: number
    name: string
    image: string
    base: string
    pair: string
    availableNetworks: SavingsNetwork[]
    apr: string
    balance: string

    getContract(chainId: ChainId, web3: Web3): Contract
    getApr(): Promise<string>
    getBalance(chainId: ChainId, web3: Web3, account: string): Promise<string>
    deposit(account: string, chainId: ChainId, web3: Web3, value: BigNumber): Promise<boolean>
    withdraw(account: string, chainId: ChainId, web3: Web3, value: BigNumber): Promise<boolean>
}

export enum TabType {
    Deposit = 'deposit',
    Withdraw = 'withdraw',
}
