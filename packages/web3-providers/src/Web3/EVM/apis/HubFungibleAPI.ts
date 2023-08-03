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

const Approval = new ApprovalAPI()
const ChainbaseFungibleToken = new ChainbaseFungibleTokenAPI()
const Cloudflare = new CloudflareAPI()
const CoinGeckoPriceEVM = new CoinGeckoPriceAPI_EVM()
const DeBankFungibleToken = new DeBankFungibleTokenAPI()
const GoPlusAuthorization = new GoPlusAuthorizationAPI()
const R2D2TokenList = new R2D2TokenListAPI()
const Rabby = new RabbyAPI()
const Zerion = new ZerionAPI()

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
                [SourceType.Chainbase]: ChainbaseFungibleToken,
                [SourceType.DeBank]: DeBankFungibleToken,
                [SourceType.Zerion]: Zerion,
                [SourceType.GoPlus]: GoPlusAuthorization,
                [SourceType.Rabby]: Rabby,
                [SourceType.Approval]: Approval,
                [SourceType.R2D2]: R2D2TokenList,
                [SourceType.CF]: Cloudflare,
                [SourceType.CoinGecko]: CoinGeckoPriceEVM,
            },
            [
                DeBankFungibleToken,
                Approval,
                Zerion,
                ChainbaseFungibleToken,
                Rabby,
                GoPlusAuthorization,
                R2D2TokenList,
                Cloudflare,
                CoinGeckoPriceEVM,
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
