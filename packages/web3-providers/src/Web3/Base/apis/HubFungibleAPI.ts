import { isEmpty } from 'lodash-es'
import {
    attemptUntil,
    type FungibleTokenSecurity,
    type FungibleToken,
    type FungibleAsset,
    type FungibleTokenSpender,
} from '@masknet/web3-shared-base'
import { type Pageable, createPageable, createIndicator, EMPTY_LIST } from '@masknet/shared-base'
import type {
    AuthorizationAPI,
    FungibleTokenAPI,
    TokenListAPI,
    TokenIconAPI,
    PriceAPI,
} from '@masknet/web3-providers/types'
import { HubProviderAPI_Base } from './HubProviderAPI.js'
import type { HubOptions_Base } from './HubOptionsAPI.js'

export class HubFungibleAPI_Base<
    ChainId,
    SchemaType,
    ProviderType,
    NetworkType,
    Transaction,
    TransactionParameter,
> extends HubProviderAPI_Base<ChainId, SchemaType, ProviderType, NetworkType, Transaction, TransactionParameter> {
    protected getProviders(
        initial?: HubOptions_Base<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            FungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType> &
            TokenIconAPI.Provider<ChainId> &
            PriceAPI.Provider<ChainId>
    > {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenBalance(address: string, initial?: HubOptions_Base<ChainId>): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenList?.(options.chainId)),
            EMPTY_LIST,
        )
    }

    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<string[]> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenIconURLs?.(options.chainId, address)),
            EMPTY_LIST,
        )
    }

    async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<number | undefined> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenPrice?.(options.chainId, address)),
            0,
        )
    }

    async getFungibleTokenSpenders(
        chainId: ChainId,
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Array<FungibleTokenSpender<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, chainId, account })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
            isEmpty,
        )
    }

    async getFungibleAsset(
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<FungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, options)),
            undefined,
        )
    }

    async getFungibleAssets(
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, account })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getTrustedFungibleAssets(
        account: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, account })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getTrustedAssets?.(options.account, trustedFungibleTokens, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getFungibleToken(
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokens(
        account: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Pageable<Error | FungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}
