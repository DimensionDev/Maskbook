import { SourceType, attemptUntil } from '@masknet/web3-shared-base'
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
import { ConnectionReadonlyAPI } from './ConnectionReadonlyAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import type { AuthorizationAPI, FungibleTokenAPI, TokenListAPI, TokenIconAPI, PriceAPI } from '../../../entry-types.js'
import { ApprovalAPI } from '../../../Approval/index.js'
import { ChainbaseFungibleTokenAPI } from '../../../Chainbase/index.js'
import { CloudflareAPI } from '../../../Cloudflare/index.js'
import { CoinGeckoPriceAPI_EVM } from '../../../CoinGecko/index.js'
import { DeBankFungibleTokenAPI } from '../../../DeBank/index.js'
import { GoPlusAuthorizationAPI } from '../../../GoPlusLabs/index.js'
import { R2D2TokenListAPI } from '../../../R2D2/index.js'
import { RabbyAPI } from '../../../Rabby/index.js'
import { ZerionAPI } from '../../../Zerion/index.js'

export class HubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    MessageRequest,
    MessageResponse,
    Transaction,
    TransactionParameter
> {
    private Approval = new ApprovalAPI()
    private ChainbaseFungibleToken = new ChainbaseFungibleTokenAPI()
    private Cloudflare = new CloudflareAPI()
    private CoinGeckoPriceEVM = new CoinGeckoPriceAPI_EVM()
    private DeBankFungibleToken = new DeBankFungibleTokenAPI()
    private GoPlusAuthorization = new GoPlusAuthorizationAPI()
    private R2D2TokenList = new R2D2TokenListAPI()
    private Rabby = new RabbyAPI()
    private Zerion_ = new ZerionAPI()

    protected override HubOptions = new HubOptionsAPI(this.options)

    private Web3 = new ConnectionReadonlyAPI()

    protected override getProviders(initial?: HubOptions_Base<ChainId>) {
        const { indicator } = this.HubOptions.fill(initial)

        // only the first page is available
        if ((indicator?.index ?? 0) > 0) return []

        return this.getPredicateProviders<
            AuthorizationAPI.Provider<ChainId> &
                FungibleTokenAPI.Provider<ChainId, SchemaType> &
                TokenListAPI.Provider<ChainId, SchemaType> &
                TokenIconAPI.Provider<ChainId> &
                PriceAPI.Provider<ChainId>
        >(
            {
                [SourceType.Chainbase]: this.ChainbaseFungibleToken,
                [SourceType.DeBank]: this.DeBankFungibleToken,
                [SourceType.Zerion]: this.Zerion_,
                [SourceType.GoPlus]: this.GoPlusAuthorization,
                [SourceType.Rabby]: this.Rabby,
                [SourceType.Approval]: this.Approval,
                [SourceType.R2D2]: this.R2D2TokenList,
                [SourceType.CF]: this.Cloudflare,
                [SourceType.CoinGecko]: this.CoinGeckoPriceEVM,
            },
            [
                this.DeBankFungibleToken,
                this.Approval,
                this.Zerion_,
                this.ChainbaseFungibleToken,
                this.Rabby,
                this.GoPlusAuthorization,
                this.R2D2TokenList,
                this.Cloudflare,
                this.CoinGeckoPriceEVM,
            ],
            initial,
        )
    }

    override getFungibleToken(address: string, initial?: HubOptions_Base<ChainId> | undefined) {
        return attemptUntil(
            [
                () => Web3StateRef.value.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address),
                () => this.Web3.getFungibleToken(address, initial),
            ],
            undefined,
        )
    }
}
