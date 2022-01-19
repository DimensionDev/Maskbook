import type { ERC20TokenDetailed, ChainIdOptionalRecord } from '@masknet/web3-shared-evm'

export interface ERC20TokenTable {
    [tokenAddress: string]: ERC20TokenDetailed[]
}

export type ERC20TokenCustomizedBase = Readonly<ChainIdOptionalRecord<ERC20TokenTable>>

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<ERC20TokenDetailed[]>>
