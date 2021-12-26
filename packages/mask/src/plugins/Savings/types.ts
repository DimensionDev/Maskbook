import type BigNumber from 'bignumber.js'
import type Web3 from 'web3'

export interface SavingsNetwork {
    chainId: number
    chainName: string
}

export interface SavingsProtocol {
    id: number
    name: string
    image: string
    base: string
    pair: string
    apr: string
    balance: string
    deposit(account: string, chainId: number, web3: Web3, value: BigNumber): Promise<boolean>
    withdraw(account: string, chainId: number, web3: Web3, value: BigNumber): Promise<boolean>
    availableNetworks: SavingsNetwork[]
}
