import {
    HubOptions,
    attemptUntil,
    Pageable,
    createPageable,
    createIndicator,
    HubIndicator,
    FungibleTokenSecurity,
    FungibleToken,
    FungibleAsset,
    FungibleTokenSpender,
} from '@masknet/web3-shared-base'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { AuthorizationAPI, FungibleTokenAPI, TokenListAPI } from '@masknet/web3-providers'
import { HubStateBaseClient } from '../Hub'

export class HubStateFungibleClient<ChainId, SchemaType> extends HubStateBaseClient<ChainId> {
    protected getProviders(
        initial?: HubOptions<ChainId>,
    ): Array<
        AuthorizationAPI.Provider<ChainId> &
            FungibleTokenAPI.Provider<ChainId, SchemaType> &
            TokenListAPI.Provider<ChainId, SchemaType>
    > {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenBalance(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenSecurity(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleTokenSecurity> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokensFromTokenList(
        chainId: ChainId,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleToken<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenList?.(options.chainId)),
            EMPTY_LIST,
        )
    }

    async getFungibleTokenIconURLs(
        chainId: ChainId,
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<string[]> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenPrice(chainId: ChainId, address: string, initial?: HubOptions<ChainId>): Promise<number> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokenSpenders(
        chainId: ChainId,
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Array<FungibleTokenSpender<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            chainId,
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getFungibleTokenSpenders?.(options.chainId, options.account)),
            EMPTY_LIST,
        )
    }

    async getFungibleAsset(
        address: string,
        initial?: HubOptions<ChainId>,
    ): Promise<FungibleAsset<ChainId, SchemaType>> {
        throw new Error('Method not implemented.')
    }

    async getFungibleAssets(
        account: string,
        initial?: HubOptions<ChainId>,
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>>> {
        const options = this.getOptions(initial, {
            account,
        })
        const providers = this.getProviders(initial)
        return attemptUntil(
            providers.map((x) => () => x.getAssets?.(options.account, options)),
            createPageable(EMPTY_LIST, createIndicator(options.indicator)),
        )
    }

    async getFungibleToken(
        address: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<FungibleToken<ChainId, SchemaType> | undefined> {
        throw new Error('Method not implemented.')
    }

    async getFungibleTokens(
        account: string,
        initial?: HubOptions<ChainId, HubIndicator> | undefined,
    ): Promise<Pageable<Error | FungibleToken<ChainId, SchemaType>>> {
        throw new Error('Method not implemented.')
    }
}
