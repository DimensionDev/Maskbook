import urlcat from 'urlcat'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type PageIndicator,
    type Pageable,
    EMPTY_LIST,
} from '@masknet/shared-base'
import { type FungibleAsset, TokenType } from '@masknet/web3-shared-base'
import { ChainId, isNativeTokenAddress, isValidAddress, isValidChainId, SchemaType } from '@masknet/web3-shared-evm'
import type { FT, FT_Price } from '../types.js'
import { fetchFromChainbase } from '../helpers.js'
import type { FungibleTokenAPI, BaseHubOptions } from '../../entry-types.js'

class ChainbaseFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    createFungibleAssetFromFT(chainId: ChainId, token: FT) {
        return {
            chainId,
            id: token.contract_address,
            address: token.contract_address,
            type: TokenType.Fungible,
            schema: SchemaType.ERC20,
            name: token.name,
            symbol: token.symbol,
            decimals: token.decimals,
            balance: token.balance,
            value: {
                usd: token.current_usd_price.toString(),
            },
        }
    }

    async getAsset(address: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const token = await fetchFromChainbase<FT>(
            urlcat('/v1/token/metadata', {
                chain_id: chainId,
                contract_address: address,
            }),
        )

        if (!token) return
        return this.createFungibleAssetFromFT(chainId, token)
    }
    async getAssets(
        address: string,
        { chainId = ChainId.Mainnet, indicator }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<FungibleAsset<ChainId, SchemaType>, PageIndicator>> {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const tokens = await fetchFromChainbase<FT[]>(
            urlcat('/v1/account/tokens', {
                chain_id: chainId,
                address,
                page: (indicator?.index || 0) + 1,
            }),
        )

        if (!tokens) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const assets = tokens.map((x) => this.createFungibleAssetFromFT(chainId, x))
        return createPageable(
            assets,
            createIndicator(indicator),
            assets.length ? createNextIndicator(indicator) : undefined,
        )
    }

    async getFungibleTokenPrice(chainId: ChainId, address: string) {
        if (isNativeTokenAddress(address) || !isValidAddress(address) || chainId !== ChainId.Mainnet) return undefined
        const data = await fetchFromChainbase<FT_Price>(
            urlcat('/v1/token/price', { chain_id: chainId, contract_address: address }),
        )

        return data?.price
    }
}
export const ChainbaseFungibleToken = new ChainbaseFungibleTokenAPI()
