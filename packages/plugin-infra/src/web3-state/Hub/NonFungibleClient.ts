import {
    HubOptions,
    NonFungibleAsset,
    attemptUntil,
    Pageable,
    createPageable,
    createIndicator,
    NonFungibleCollection,
    NonFungibleTokenRarity,
    HubIndicator,
    NonFungibleTokenEvent,
    NonFungibleTokenOrder,
    OrderSide,
    NonFungibleTokenContract,
    NonFungibleTokenSecurity,
    NonFungibleToken,
    NonFungibleContractSpenderAuthorization,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { AuthorizationAPI, NonFungibleTokenAPI, TokenListAPI } from '@masknet/web3-providers'
import { HubStateClient } from '../Hub'

export class HubStateNonFungibleClient<ChainId, SchemaType> extends HubStateClient<ChainId> {
    protected getProviders(
        initial?: HubOptions<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            NonFungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType>
    > {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenBalance(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleRarity(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenRarity<ChainId> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getRarity?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAsset(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleAsset<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAsset?.(address, tokenId, options)),
            undefined,
        )
    }

    async getNonFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleAssetsByCollection(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssetsByCollection?.(address, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenContract(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenContract<ChainId, SchemaType> | undefined> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getContract?.(address, options)),
            undefined,
        )
    }

    async getNonFungibleTokenPrice(
        chainId: ChainId,
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId>,
    ): Promise<never> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenEvents(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenEvent<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getEvents?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenListings(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getListings?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOffers(
        address: string,
        tokenId: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOffers?.(address, tokenId, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<NonFungibleTokenOrder<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getOrders?.(address, tokenId, side, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionsByOwner(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByOwner?.(account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleCollectionsByKeyword(
        keyword: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getCollectionsByKeyword?.(keyword, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getNonFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<NonFungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        tokenId?: string | undefined,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }

    async getNonFungibleApprovedContracts(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<NonFungibleContractSpenderAuthorization<ChainId, SchemaType>>> {
        const options = this.getOptions(initial)
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getNonFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
        )
    }
}
