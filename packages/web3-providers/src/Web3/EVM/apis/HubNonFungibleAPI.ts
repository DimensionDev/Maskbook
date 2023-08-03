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
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '../../../entry-types.js'
import { AlchemyEVM_API } from '../../../Alchemy/index.js'
import { ApprovalAPI } from '../../../Approval/index.js'
import { ChainbaseNonFungibleTokenAPI } from '../../../Chainbase/index.js'
import { GemAPI } from '../../../Gem/index.js'
import { GoPlusAuthorizationAPI } from '../../../GoPlusLabs/index.js'
import { LooksRareAPI } from '../../../LooksRare/index.js'
import { NFTScanNonFungibleTokenAPI_EVM } from '../../../NFTScan/index.js'
import { OpenSeaAPI } from '../../../OpenSea/index.js'
import { R2D2TokenListAPI } from '../../../R2D2/index.js'
import { RabbyAPI } from '../../../Rabby/index.js'
import { RaribleAPI } from '../../../Rarible/index.js'
import { SimpleHashAPI_EVM } from '../../../SimpleHash/index.js'
import { X2Y2API } from '../../../X2Y2/index.js'
import { ZerionNonFungibleTokenAPI } from '../../../Zerion/index.js'
import { ZoraAPI } from '../../../Zora/index.js'

const AlchemyEVM = new AlchemyEVM_API()
const Approval = new ApprovalAPI()
const ChainbaseNonFungibleToken = new ChainbaseNonFungibleTokenAPI()
const Gem = new GemAPI()
const GoPlusAuthorization = new GoPlusAuthorizationAPI()
const LooksRare = new LooksRareAPI()
const NFTScanNonFungibleTokenEVM = new NFTScanNonFungibleTokenAPI_EVM()
const OpenSea = new OpenSeaAPI()
const R2D2TokenList = new R2D2TokenListAPI()
const Rabby = new RabbyAPI()
const Rarible = new RaribleAPI()
const SimpleHashEVM = new SimpleHashAPI_EVM()
const X2Y2 = new X2Y2API()
const ZerionNonFungibleToken = new ZerionNonFungibleTokenAPI()
const Zora = new ZoraAPI()

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
