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
    private AlchemyEVM = new AlchemyEVM_API()
    private Approval = new ApprovalAPI()
    private ChainbaseNonFungibleToken = new ChainbaseNonFungibleTokenAPI()
    private Gem = new GemAPI()
    private GoPlusAuthorization = new GoPlusAuthorizationAPI()
    private LooksRare = new LooksRareAPI()
    private NFTScanNonFungibleTokenEVM = new NFTScanNonFungibleTokenAPI_EVM()
    private OpenSea = new OpenSeaAPI()
    private R2D2TokenList = new R2D2TokenListAPI()
    private Rabby = new RabbyAPI()
    private Rarible = new RaribleAPI()
    private SimpleHashEVM = new SimpleHashAPI_EVM()
    private X2Y2 = new X2Y2API()
    private ZerionNonFungibleToken = new ZerionNonFungibleTokenAPI()
    private Zora = new ZoraAPI()

    protected override HubOptions = new HubOptionsAPI(this.options)

    protected override getProviders(initial?: HubOptions) {
        const options = this.HubOptions.fill(initial)
        return this.getPredicateProviders<
            | AuthorizationAPI.Provider<ChainId>
            | NonFungibleTokenAPI.Provider<ChainId, SchemaType>
            | TokenListAPI.Provider<ChainId, SchemaType>
        >(
            {
                [SourceType.X2Y2]: this.X2Y2,
                [SourceType.Chainbase]: this.ChainbaseNonFungibleToken,
                [SourceType.Zerion]: this.ZerionNonFungibleToken,
                [SourceType.NFTScan]: this.NFTScanNonFungibleTokenEVM,
                [SourceType.Rarible]: this.Rarible,
                [SourceType.OpenSea]: this.OpenSea,
                [SourceType.Approval]: this.Approval,
                [SourceType.Alchemy_EVM]: this.AlchemyEVM,
                [SourceType.LooksRare]: this.LooksRare,
                [SourceType.Zora]: this.Zora,
                [SourceType.Gem]: this.Gem,
                [SourceType.GoPlus]: this.GoPlusAuthorization,
                [SourceType.Rabby]: this.Rabby,
                [SourceType.R2D2]: this.R2D2TokenList,
                [SourceType.SimpleHash]: this.SimpleHashEVM,
            },
            options.chainId === ChainId.Mainnet
                ? [
                      this.X2Y2,
                      this.SimpleHashEVM,
                      this.NFTScanNonFungibleTokenEVM,
                      this.ZerionNonFungibleToken,
                      this.Rarible,
                      this.OpenSea,
                      this.AlchemyEVM,
                      this.LooksRare,
                      this.Zora,
                      this.Gem,
                      this.Approval,
                      this.GoPlusAuthorization,
                      this.Rabby,
                      this.R2D2TokenList,
                  ]
                : [
                      this.SimpleHashEVM,
                      this.NFTScanNonFungibleTokenEVM,
                      this.ZerionNonFungibleToken,
                      this.Rarible,
                      this.AlchemyEVM,
                      this.OpenSea,
                      this.LooksRare,
                      this.Zora,
                      this.Approval,
                      this.Gem,
                      this.GoPlusAuthorization,
                      this.Rabby,
                      this.R2D2TokenList,
                  ],
            initial,
        )
    }
}
