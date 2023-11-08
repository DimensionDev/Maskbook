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
import type { HubOptions_Base } from './HubOptionsAPI.js'
import { HubProviderAPI_Base } from './HubProviderAPI.js'

export abstract class HubFungibleAPI_Base<ChainId, SchemaType> extends HubProviderAPI_Base<ChainId> {
    protected abstract getProviders(
        initial?: HubOptions_Base<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            FungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType> &
            TokenIconAPI.Provider<ChainId> &
            PriceAPI.Provider<ChainId>
    >

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.HubOptions.fill({ ...initial, chainId })
        const providers = this.getProviders(initial)
        return queryClient.fetchQuery(['get-fungible-token-list', options.chainId, initial], async () => {
            return attemptUntil(
                providers.map((x) => () => x.getFungibleTokenList?.(options.chainId)),
                EMPTY_LIST,
            )
        })
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
            undefined,
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

    abstract getFungibleToken(
        address: string,
        initial?: HubOptions_Base<ChainId>,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined>
}
