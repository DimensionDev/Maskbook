import { SourceType } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import defer * as AlchemyEVM from '../../../Alchemy/index.js'
import defer * as ChainbaseNonFungibleToken from '../../../Chainbase/index.js'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'
import defer * as GoPlusAuthorization from '../../../GoPlusLabs/index.js'
import defer * as NFTScanNonFungibleTokenEVM from '../../../NFTScan/index.js'
import defer * as R2D2TokenList from '../../../R2D2/index.js'
import defer * as Rabby from '../../../Rabby/index.js'
import defer * as Zora from '../../../Zora/index.js'
import { BaseHubNonFungible } from '../../Base/apis/HubNonFungible.js'
import type { EVMHubOptions } from '../types/index.js'
import { EVMHubOptionsProvider } from './HubOptionsAPI.js'

export class HubNonFungibleAPI extends BaseHubNonFungible<ChainId, SchemaType> {
    protected override HubOptions = new EVMHubOptionsProvider(this.options)

    protected override getProvidersNonFungible(initial?: EVMHubOptions) {
        const options = this.HubOptions.fill(initial)
        return this.getPredicateProviders<
            | AuthorizationAPI.Provider<ChainId>
            | NonFungibleTokenAPI.Provider<ChainId, SchemaType>
            | TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.Chainbase]: ChainbaseNonFungibleToken.ChainbaseNonFungibleToken,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                [SourceType.Alchemy_EVM]: AlchemyEVM.AlchemyEVM,
                [SourceType.Zora]: Zora.Zora,
                [SourceType.GoPlus]: GoPlusAuthorization.GoPlusAuthorization,
                [SourceType.Rabby]: Rabby.Rabby,
                [SourceType.R2D2]: R2D2TokenList.R2D2TokenList,
            },
            options.chainId === ChainId.Mainnet ?
                [
                    NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                    AlchemyEVM.AlchemyEVM,
                    Zora.Zora,
                    GoPlusAuthorization.GoPlusAuthorization,
                    Rabby.Rabby,
                    R2D2TokenList.R2D2TokenList,
                ]
            :   [
                    NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                    AlchemyEVM.AlchemyEVM,
                    Zora.Zora,
                    GoPlusAuthorization.GoPlusAuthorization,
                    Rabby.Rabby,
                    R2D2TokenList.R2D2TokenList,
                ],
            initial,
        )
    }
}
