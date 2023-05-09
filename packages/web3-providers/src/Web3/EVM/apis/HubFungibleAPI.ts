import {
    Approval,
    ChainbaseFungibleToken,
    Cloudflare,
    CoinGeckoPriceEVM,
    DeBankFungibleToken,
    GoPlusAuthorization,
    R2D2TokenList,
    Rabby,
    Zerion,
} from '@masknet/web3-providers'
import type {
    AuthorizationAPI,
    FungibleTokenAPI,
    TokenListAPI,
    TokenIconAPI,
    PriceAPI,
} from '@masknet/web3-providers/types'
import { SourceType, attemptUntil } from '@masknet/web3-shared-base'
import {
    ChainId,
    type SchemaType,
    type ProviderType,
    type NetworkType,
    type Transaction,
    type TransactionParameter,
} from '@masknet/web3-shared-evm'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'
import { HubFungibleAPI_Base } from '../../Base/apis/HubFungibleAPI.js'
import { HubOptionsAPI } from './HubOptionsAPI.js'
import { ConnectionAPI } from './ConnectionAPI.js'
import { Web3StateRef } from './Web3StateAPI.js'

export class HubFungibleAPI extends HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter
> {
    private Web3 = new ConnectionAPI()

    protected override HubOptions = new HubOptionsAPI(this.options)

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
                () =>
                    Web3StateRef.value.Token?.createFungibleToken?.(initial?.chainId ?? ChainId.Mainnet, address ?? ''),
                () => this.Web3.getFungibleToken?.(address ?? '', initial),
            ],
            undefined,
        )
    }
}
