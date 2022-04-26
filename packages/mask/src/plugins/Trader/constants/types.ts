import type { FungibleAsset } from '@masknet/web3-shared-base'
import type { ChainIdOptionalRecord, ChainId, SchemaType } from '@masknet/web3-shared-evm'

export interface ERC20TokenTable {
    [tokenAddress: string]: FungibleAsset<ChainId, SchemaType.ERC20>[]
}

export type ERC20TokenCustomizedBase = Readonly<ChainIdOptionalRecord<ERC20TokenTable>>

export type ERC20AgainstToken = Readonly<ChainIdOptionalRecord<FungibleAsset<ChainId, SchemaType.ERC20>[]>>
