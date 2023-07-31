import {
    AlchemyEVM,
    Approval,
    ChainbaseNonFungibleToken,
    Gem,
    GoPlusAuthorization,
    LooksRare,
    NFTScanNonFungibleTokenEVM,
    OpenSea,
    R2D2TokenList,
    Rabby,
    Rarible,
    SimpleHashEVM,
    X2Y2,
    ZerionNonFungibleToken,
    Zora,
} from '@masknet/web3-providers'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '@masknet/web3-providers/types'
import { SourceType } from '@masknet/web3-shared-base'
import {
    ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type MessageRequest,
    type MessageResponse,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import { HubNonFungibleAPI_Base } from '../../Base/apis/HubNonFungibleAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { HubOptions } from '../types/index.js'

export class HubNonFungibleAPI extends HubNonFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    protected override HubOptions = new HubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions) {
        const options = this.HubOptions.fill(initial)
        return this.getPredicateProviders<
            | AuthorizationAPI.Provider<ChainId>
            | NonFungibleTokenAPI.Provider<ChainId, SchemaType>
            | TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.X2Y2]: X2Y2,
                [SourceType.Chainbase]: ChainbaseNonFungibleToken,
                [SourceType.Zerion]: ZerionNonFungibleToken,
                [SourceType.NFTScan]: NFTScanNonFungibleTokenEVM,
                [SourceType.Rarible]: Rarible,
                [SourceType.OpenSea]: OpenSea,
                [SourceType.Approval]: Approval,
                [SourceType.Alchemy_EVM]: AlchemyEVM,
                [SourceType.LooksRare]: LooksRare,
                [SourceType.Zora]: Zora,
                [SourceType.Gem]: Gem,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.SimpleHash]: SimpleHashEVM,
            },
            options.chainId === ChainId.Mainnet
                ? [
                      X2Y2,
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      OpenSea,
                      AlchemyEVM,
                      LooksRare,
                      Zora,
                      Gem,
                      Approval,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ]
                : [
                      SimpleHashEVM,
                      NFTScanNonFungibleTokenEVM,
                      ZerionNonFungibleToken,
                      Rarible,
                      AlchemyEVM,
                      OpenSea,
                      LooksRare,
                      Zora,
                      Approval,
                      Gem,
                      GoPlusAuthorization,
                      Rabby,
                      R2D2TokenList,
                  ],
            initial,
        )
    }
}
