import { AssetState } from '@masknet/plugin-infra/web3'
import type { Web3Pagination } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-flow'
import { FlowRPC } from '../messages'

export class Asset extends AssetState<ChainId, SchemaType> {
    override async getFungibleAssets(address: string, pagination?: Web3Pagination<ChainId>) {
        return FlowRPC.getFungibleAssets(pagination?.chainId ?? ChainId.Mainnet, address)
    }
}
