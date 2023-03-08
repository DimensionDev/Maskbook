import type { NonFungibleTokenAPI } from '../entry-types.js'
import { type Web3Helper } from '@masknet/web3-helpers'
import { type HubOptions } from '@masknet/web3-shared-base'
import { NetworkPluginID } from '@masknet/shared-base'
import { ChainId } from '@masknet/web3-shared-evm'

export class SimpleHashProviderAPI
    implements NonFungibleTokenAPI.Provider<Web3Helper.ChainIdAll, Web3Helper.SchemaTypeAll>
{
    getAsset(
        address: string,
        tokenId: string,
        { networkPluginId = NetworkPluginID.PLUGIN_EVM, chainId = ChainId.Mainnet }: HubOptions<Web3Helper.ChainIdAll>,
    ) {
        const path = '/api/v0/nfts/ethereum/'
        return
    }
}
