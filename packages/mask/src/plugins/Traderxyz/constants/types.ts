import type { ChainId, ERC20TokenDetailed } from '@masknet/web3-shared-evm'

export interface ERC20TokenTable {
    [tokenAddress: string]: ERC20TokenDetailed[]
}

export type ERC20TokenCustomizedBase = {
    readonly [chainId in ChainId]?: ERC20TokenTable
}

export type ERC20AgainstToken = {
    readonly [chainId in ChainId]: ERC20TokenDetailed[]
}
