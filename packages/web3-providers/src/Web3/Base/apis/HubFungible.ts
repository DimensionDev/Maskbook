import { EMPTY_LIST, createIndicator, createPageable, type Pageable } from '@masknet/shared-base'
import { queryClient } from '@masknet/shared-base-ui'
import {
    attemptUntil,
    type FungibleAsset,
    type FungibleToken,
    type FungibleTokenSpender,
} from '@masknet/web3-shared-base'
import { isEmpty } from 'lodash-es'
import type { AuthorizationAPI, FungibleTokenAPI, PriceAPI, TokenIconAPI, TokenListAPI } from '../../../entry-types.js'
import type { BaseHubOptions } from './HubOptions.js'
import { AbstractBaseHubProvider } from './HubProvider.js'

export abstract class BaseHubFungible<ChainId, SchemaType> extends AbstractBaseHubProvider<ChainId> {
    protected abstract getProvidersFungible(
        initial?: BaseHubOptions<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            FungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType> &
            TokenIconAPI.Provider<ChainId> &
            PriceAPI.Provider<ChainId>
    >

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const allProviders = this.getProvidersFungible(initial)
        return queryClient.fetchQuery({
            queryKey: ['get-fungible-token-list', options.chainId, initial],
            queryFn: async () => {
                const providers = allProviders.filter((x) => x.getNonFungibleTokenList)
                return attemptUntil(
                    providers.map((x) => () => x.getFungibleTokenList!(options.chainId)),
                    EMPTY_LIST,
                )
            },
        })
    }

    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<string[]> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenIconURLs?.(options.chainId, address)),
            EMPTY_LIST,
        )
    }

    async getFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<number | undefined> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenPrice?.(options.chainId, address)),
            undefined,
        )
    }

    async getFungibleTokenSpenders(
        chainId: ChainId,
        account: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Array<FungibleTokenSpender<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, chainId, account })
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
            isEmpty,
        )
    }

    async getFungibleAsset(
        address: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<FungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.HubOptions.fill(initial)
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, options)),
            undefined,
        )
    }

    async getFungibleAssets(
        account: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, account })
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getTrustedFungibleAssets(
        account: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, account })
        const providers = this.getProvidersFungible(initial)
        return attemptUntil(
            providers.map((x) => () => x.getTrustedAssets?.(options.account, trustedFungibleTokens, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    abstract getFungibleToken(
        address: string,
        initial?: BaseHubOptions<ChainId>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined>
}
