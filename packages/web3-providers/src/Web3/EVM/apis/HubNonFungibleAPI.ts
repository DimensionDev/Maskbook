import { SourceType } from '@masknet/web3-shared-base'
import { ChainId, type SchemaType } from '@masknet/web3-shared-evm'
import { BaseHubNonFungible } from '../../Base/apis/HubNonFungible.js'
import { EVMHubOptionsProvider } from './HubOptionsAPI.js'
import type { EVMHubOptions } from '../types/index.js'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'
import * as AlchemyEVM from /* webpackDefer: true */ '../../../Alchemy/index.js'
import * as ChainbaseNonFungibleToken from /* webpackDefer: true */ '../../../Chainbase/index.js'
import * as Gem from /* webpackDefer: true */ '../../../Gem/index.js'
import * as GoPlusAuthorization from /* webpackDefer: true */ '../../../GoPlusLabs/index.js'
import * as NFTScanNonFungibleTokenEVM from /* webpackDefer: true */ '../../../NFTScan/index.js'
import * as OpenSea from /* webpackDefer: true */ '../../../OpenSea/index.js'
import * as R2D2TokenList from /* webpackDefer: true */ '../../../R2D2/index.js'
import * as Rabby from /* webpackDefer: true */ '../../../Rabby/index.js'
import * as SimpleHashEVM from /* webpackDefer: true */ '../../../SimpleHash/index.js'
import * as X2Y2 from /* webpackDefer: true */ '../../../X2Y2/index.js'
import * as ZerionNonFungibleToken from /* webpackDefer: true */ '../../../Zerion/index.js'
import * as Zora from /* webpackDefer: true */ '../../../Zora/index.js'

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
                [SourceType.X2Y2]: X2Y2.X2Y2,
                [SourceType.Chainbase]: ChainbaseNonFungibleToken.ChainbaseNonFungibleToken,
                [SourceType.Zerion]: ZerionNonFungibleToken.ZerionNonFungibleToken,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                [SourceType.OpenSea]: OpenSea.OpenSea,
                [SourceType.Alchemy_EVM]: AlchemyEVM.AlchemyEVM,
                [SourceType.Zora]: Zora.Zora,
                [SourceType.Gem]: Gem.Gem,
                [SourceType.GoPlus]: GoPlusAuthorization.GoPlusAuthorization,
                [SourceType.Rabby]: Rabby.Rabby,
                [SourceType.R2D2]: R2D2TokenList.R2D2TokenList,
                [SourceType.SimpleHash]: SimpleHashEVM.SimpleHashEVM,
            },
            options.chainId === ChainId.Mainnet ?
                [
                    X2Y2.X2Y2,
                    SimpleHashEVM.SimpleHashEVM,
                    NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                    ZerionNonFungibleToken.ZerionNonFungibleToken,
                    OpenSea.OpenSea,
                    AlchemyEVM.AlchemyEVM,
                    Zora.Zora,
                    Gem.Gem,
                    GoPlusAuthorization.GoPlusAuthorization,
                    Rabby.Rabby,
                    R2D2TokenList.R2D2TokenList,
                ]
            :   [
                    SimpleHashEVM.SimpleHashEVM,
                    NFTScanNonFungibleTokenEVM.NFTScanNonFungibleTokenEVM,
                    ZerionNonFungibleToken.ZerionNonFungibleToken,
                    AlchemyEVM.AlchemyEVM,
                    OpenSea.OpenSea,
                    Zora.Zora,
                    Gem.Gem,
                    GoPlusAuthorization.GoPlusAuthorization,
                    Rabby.Rabby,
                    R2D2TokenList.R2D2TokenList,
                ],
            initial,
        )
    }
}
