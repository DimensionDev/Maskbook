import urlcat from 'urlcat'
import { uniqBy } from 'lodash-es'
import { BigNumber } from 'bignumber.js'
import { getUnixTime } from 'date-fns'
import { createPageable, createIndicator, createNextIndicator, EMPTY_LIST } from '@masknet/shared-base'
import {
    CurrencyType,
    type NonFungibleToken,
    type NonFungibleCollection,
    type NonFungibleTokenEvent,
    type NonFungibleTokenOrder,
    OrderSide,
    scale10,
    TokenType,
    createNonFungibleTokenContract,
    type NonFungibleAsset,
    type NonFungibleTokenStats,
    formatPercentage,
    dividedBy,
    resolveIPFS_URL,
    SourceType,
} from '@masknet/web3-shared-base'
import { ChainId, SchemaType, createERC20Token, isValidChainId, resolveImageURL } from '@masknet/web3-shared-evm'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import {
    type OpenSeaAssetContract,
    type OpenSeaAssetEvent,
    type OpenSeaCollection,
    type OpenSeaCollectionStats,
    type OpenSeaCustomAccount,
    type OpenSeaAssetResponse,
    EventType,
} from './types.js'
import { getOrderUSDPrice } from './utils.js'
import { OPENSEA_ACCOUNT_URL, OPENSEA_API_URL } from './constants.js'
import { getAssetFullName } from '../helpers/getAssetFullName.js'
import { getPaymentToken } from '../helpers/getPaymentToken.js'
import { fetchSquashedJSON } from '../helpers/fetchJSON.js'
import { resolveActivityType } from '../helpers/resolveActivityType.js'
import type { BaseHubOptions, NonFungibleTokenAPI } from '../entry-types.js'

async function fetchFromOpenSea<T>(url: string, chainId: ChainId, init?: RequestInit) {
    if (![ChainId.Mainnet, ChainId.Rinkeby, ChainId.Polygon].includes(chainId)) return
    return fetchSquashedJSON<T>(urlcat(OPENSEA_API_URL, url), { method: 'GET', ...init })
}

function createTokenDetailed(
    chainId: ChainId,
    token: {
        address: string
        decimals: number
        name: string
        symbol: string
        image_url?: string
    },
) {
    if (token.symbol === 'ETH') return EVMChainResolver.nativeCurrency(chainId)
    return createERC20Token(chainId, token.address, token.name, token.symbol, token.decimals, token.image_url)
}

function createAssetLink(chainId: ChainId, address: string, tokenId: string) {
    if (chainId === ChainId.Mainnet)
        return urlcat('https://opensea.io/assets/ethereum/:address/:tokenId', {
            address,
            tokenId,
        })
    if (chainId === ChainId.Polygon)
        return urlcat('https://opensea.io/assets/matic/:address/:tokenId', {
            address,
            tokenId,
        })
    return
}

function createAccountLink(account: OpenSeaCustomAccount | undefined) {
    if (!account) return ''
    return urlcat(OPENSEA_ACCOUNT_URL, {
        address: account.user?.username ?? account.address,
    })
}

function createNFTToken(chainId: ChainId, asset: OpenSeaAssetResponse): NonFungibleToken<ChainId, SchemaType> {
    const address = asset.token_address ?? asset.asset_contract.address
    const name = getAssetFullName(
        address,
        asset.name ?? asset.collection.name,
        asset.name ?? asset.collection.name,
        asset.token_id,
    )

    return {
        id: asset.token_address ?? asset.asset_contract.address,
        chainId,
        type: TokenType.NonFungible,
        schema: asset.asset_contract.schema_name === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
        tokenId: asset.token_id,
        address,
        metadata: {
            chainId,
            name,
            symbol: asset.asset_contract.symbol,
            description: asset.description,
            imageURL: resolveImageURL(
                decodeURIComponent(
                    asset.image_url ?? asset.image_preview_url ?? asset.image_original_url ?? asset.animation_url ?? '',
                ),
                name,
                address,
            ),
            mediaURL: decodeURIComponent(
                asset.animation_url ??
                    resolveIPFS_URL(asset.image_original_url ?? asset.image_preview_url ?? asset.image_url ?? ''),
            ),
        },
        contract: {
            chainId,
            schema: asset.asset_contract.schema_name === 'ERC1155' ? SchemaType.ERC1155 : SchemaType.ERC721,
            address,
            name: asset.name ?? asset.collection.name,
            symbol: asset.asset_contract.symbol,
            owner: asset.owner.address,
            creatorEarning: asset.asset_contract.dev_seller_fee_basis_points.toString(),
        },
        collection: {
            address,
            chainId,
            name: asset.collection.name,
            slug: asset.collection.slug,
            description: asset.collection.description,
            iconURL: decodeURIComponent(
                asset.collection.image_url ?? asset.collection.largeImage_url ?? asset.collection.featured_image_url,
            ),
            verified: ['approved', 'verified'].includes(asset.collection.safelist_request_status ?? ''),
            createdAt: getUnixTime(new Date(asset.collection.created_date)),
        },
    }
}

function createNFTAsset(chainId: ChainId, asset: OpenSeaAssetResponse): NonFungibleAsset<ChainId, SchemaType> {
    const token = createNFTToken(chainId, asset)
    const paymentToken = getPaymentToken(chainId, {
        address: asset.last_sale?.payment_token.address,
        symbol: asset.last_sale?.payment_token.symbol,
    })
    return {
        ...token,
        link: asset.opensea_link ?? asset.permalink ?? createAssetLink(chainId, token.address, token.tokenId),
        paymentTokens: uniqBy(
            asset.collection.payment_tokens.map((x) => createTokenDetailed(chainId, x)),
            (x) => x.address.toLowerCase(),
        ),
        creator: {
            address: asset.creator.address,
            nickname: asset.creator.user?.username ?? 'Unknown',
            avatarURL: asset.creator.profile_img_url,
            link: createAccountLink(asset.creator),
        },
        owner: {
            address: asset.owner.address,
            nickname: asset.owner.user?.username ?? 'Unknown',
            avatarURL: asset.owner.profile_img_url,
            link: createAccountLink(asset.owner),
        },
        traits: asset.traits.map((x) => ({
            type: x.trait_type,
            value: x.value,
            rarity: formatPercentage(dividedBy(x.trait_count, asset.collection.stats.count)),
        })),
        price:
            asset.last_sale ?
                {
                    [CurrencyType.USD]: getOrderUSDPrice(
                        asset.last_sale.total_price,
                        asset.last_sale.payment_token.usd_price,
                        asset.last_sale.payment_token.decimals,
                    ).toString(),
                }
            :   undefined,
        priceInToken:
            asset.last_sale ?
                {
                    token:
                        paymentToken ??
                        createTokenDetailed(chainId, {
                            address: asset.last_sale.payment_token.address ?? '',
                            decimals: Number(asset.last_sale.payment_token.decimals ?? '0'),
                            name: '',
                            symbol: asset.last_sale.payment_token.symbol ?? '',
                        }),
                    amount: asset.last_sale.total_price ?? '0',
                }
            :   undefined,
    }
}

function createAccount(account?: OpenSeaCustomAccount) {
    if (!account) return
    return {
        address: account.address,
        nickname: account.user?.username,
        avatarURL: account.profile_img_url,
        link: createAccountLink(account),
    }
}

function createEvent(chainId: ChainId, event: OpenSeaAssetEvent): NonFungibleTokenEvent<ChainId, SchemaType> {
    const paymentToken =
        event.payment_token ?
            createERC20Token(
                chainId,
                event.payment_token.address,
                event.payment_token.name,
                event.payment_token.symbol,
                event.payment_token.decimals,
                event.payment_token.image_url,
            )
        :   undefined
    return {
        from: createAccount(event.from_account ?? event.seller),
        to: createAccount(event.to_account ?? event.winner_account),
        id: event.id,
        chainId,
        type: resolveActivityType(event.event_type),
        assetPermalink: event.asset.permalink,
        quantity: event.quantity,
        hash: event.transaction?.transaction_hash,
        timestamp: new Date(`${event.created_date}Z`).getTime(),
        price:
            event.payment_token ?
                {
                    [CurrencyType.USD]: new BigNumber(event.bid_amount ?? event.total_price ?? 0)
                        .dividedBy(scale10(1, event.payment_token.decimals))
                        .dividedBy(event.quantity)
                        .multipliedBy(event.payment_token.usd_price ?? 1)
                        .toFixed(2),
                }
            :   undefined,
        priceInToken:
            paymentToken ?
                {
                    amount: event.bid_amount ?? event.total_price ?? '0',
                    token: paymentToken,
                }
            :   undefined,
        paymentToken,
        source: SourceType.OpenSea,
    }
}

function createOrder(
    chainId: ChainId,
    event: OpenSeaAssetEvent,
    side: OrderSide,
): NonFungibleTokenOrder<ChainId, SchemaType> {
    const amount = side === OrderSide.Buy ? event.ending_price : event.ending_price
    return {
        id: `${event.asset.permalink}_${event.created_date}`,
        chainId,
        hash: event.transaction?.transaction_hash,
        assetPermalink: event.asset.permalink,
        quantity: event.quantity,
        side: event.event_type === 'offer_entered' ? OrderSide.Buy : undefined,
        maker: createAccount(event.from_account ?? event.seller),
        taker: createAccount(event.to_account ?? event.winner_account),
        createdAt: event.created_date ? getUnixTime(new Date(event.created_date)) : undefined,
        price: {
            [CurrencyType.USD]: new BigNumber(amount ?? 0)
                .dividedBy(scale10(1, event.payment_token?.decimals ?? 0))
                .dividedBy(event.quantity)
                .multipliedBy(event.payment_token?.usd_price ?? 1)
                .toFixed(2),
        },
        priceInToken:
            event.payment_token ?
                {
                    amount: amount ?? '0',
                    token: createERC20Token(
                        chainId,
                        event.payment_token.address,
                        event.payment_token.name,
                        event.payment_token.symbol,
                        event.payment_token.decimals,
                        event.payment_token.image_url,
                    ),
                }
            :   undefined,
        source: SourceType.OpenSea,
    }
}

class OpenSeaAPI implements NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    async getAsset(address: string, tokenId: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        if (!isValidChainId(chainId)) return
        const response = await fetchFromOpenSea<OpenSeaAssetResponse>(
            urlcat('/api/v1/asset/:address/:tokenId', { address, tokenId }),
            chainId,
        )
        if (!response) return
        return createNFTAsset(chainId, response)
    }

    async getAssets(
        account: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const response = await fetchFromOpenSea<{
            assets?: OpenSeaAssetResponse[]
            next: string
            previous?: string
        }>(
            urlcat('/api/v1/assets', {
                owner: account,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
                cursor: indicator?.id,
            }),
            chainId,
        )
        const tokens = (response?.assets ?? EMPTY_LIST)
            .filter(
                (x: OpenSeaAssetResponse) =>
                    ['non-fungible', 'semi-fungible'].includes(x.asset_contract.asset_contract_type) ||
                    ['ERC721', 'ERC1155'].includes(x.asset_contract.schema_name),
            )
            .map((asset: OpenSeaAssetResponse) => createNFTAsset(chainId, asset))

        return createPageable(
            tokens,
            createIndicator(indicator),
            tokens.length === size ? createNextIndicator(indicator, response?.next) : undefined,
        )
    }

    async getContract(address: string, { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {}) {
        const contract = await fetchFromOpenSea<OpenSeaAssetContract>(
            urlcat('/api/v1/asset_contract/:address', { address }),
            chainId,
        )
        return createNonFungibleTokenContract(
            chainId,
            SchemaType.ERC721,
            address,
            contract?.name ?? 'Unknown Token',
            contract?.symbol ?? 'UNKNOWN',
        )
    }

    async getEvents(
        address: string,
        tokenId: string,
        { chainId = ChainId.Mainnet, indicator, size }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))
        const parameters = new URLSearchParams()
        parameters.append('event_type', EventType.Successful)
        parameters.append('event_type', EventType.OfferEntered)
        parameters.append('event_type', EventType.Transfer)
        parameters.append('asset_contract_address', address)
        parameters.append('token_id', tokenId)
        if (indicator?.id) parameters.append('cursor', indicator.id)
        if (size) parameters.append('limit', size.toString())

        const response = await fetchFromOpenSea<{
            asset_events: OpenSeaAssetEvent[]
            next: string
            previous?: string
        }>(`/api/v1/events?${parameters.toString()}`, chainId)
        const events = response?.asset_events.map((x) => createEvent(chainId, x)) ?? EMPTY_LIST
        return createPageable(
            events,
            createIndicator(indicator),
            events.length === size ? createNextIndicator(indicator, response?.next) : undefined,
        )
    }

    async getOrders(
        address: string,
        tokenId: string,
        side: OrderSide,
        { chainId = ChainId.Mainnet, indicator, size }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const response = await fetchFromOpenSea<{
            asset_events: OpenSeaAssetEvent[]
            next: string
            previous?: string
        }>(
            urlcat('/api/v1/events', {
                asset_contract_address: address,
                token_id: tokenId,
                cursor: indicator?.id,
                limit: size,
                event_type:
                    side === OrderSide.Sell ? 'created'
                    : side === OrderSide.Buy ? 'offer_entered'
                    : '',
            }),
            chainId,
        )

        const offers = response?.asset_events.map((x) => createOrder(chainId, x, side)) ?? EMPTY_LIST

        return createPageable(
            offers,
            createIndicator(indicator),
            offers.length === size ? createNextIndicator(indicator, response?.next) : undefined,
        )
    }

    async getCollectionsByOwner(
        address: string,
        { chainId = ChainId.Mainnet, indicator, size = 50 }: BaseHubOptions<ChainId> = {},
    ) {
        if (!isValidChainId(chainId)) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const response = await fetchFromOpenSea<OpenSeaCollection[]>(
            urlcat('/api/v1/collections', {
                asset_owner: address,
                offset: (indicator?.index ?? 0) * size,
                limit: size,
            }),
            chainId,
        )
        if (!response) return createPageable(EMPTY_LIST, createIndicator(indicator))

        const collections: Array<NonFungibleCollection<ChainId, SchemaType>> =
            response
                .map((x) => ({
                    chainId,
                    name: x.name,
                    slug: x.slug,
                    address: x.primary_asset_contracts[0]?.address,
                    symbol: x.primary_asset_contracts[0]?.symbol,
                    schema:
                        x.primary_asset_contracts[0]?.schema_name === 'ERC1155' ?
                            SchemaType.ERC1155
                        :   SchemaType.ERC721,
                    description: x.description,
                    iconURL: x.image_url,
                    balance: x.owned_asset_count,
                    verified: ['approved', 'verified'].includes(x.safelist_request_status ?? ''),
                    createdAt: getUnixTime(new Date(x.created_date)),
                }))
                .filter((x) => x.address) ?? EMPTY_LIST

        return createPageable(
            collections,
            createIndicator(indicator),
            collections.length === size ? createNextIndicator(indicator) : undefined,
        )
    }

    async getStats(
        address: string,
        { chainId = ChainId.Mainnet }: BaseHubOptions<ChainId> = {},
    ): Promise<NonFungibleTokenStats | undefined> {
        if (!isValidChainId(chainId)) return
        const assetContract = await fetchFromOpenSea<OpenSeaAssetContract>(
            urlcat('/api/v1/asset_contract/:address', { address }),
            chainId,
        )
        const slug = assetContract?.collection.slug
        if (!slug) return
        const response = await fetchFromOpenSea<{
            stats: OpenSeaCollectionStats
        }>(
            urlcat('/api/v1/collection/:slug/stats', {
                slug,
            }),
            chainId,
        )
        const stats = response?.stats
        if (!stats) return

        return {
            volume24h: stats.one_day_volume,
            floorPrice: stats.floor_price,
            count24h: stats.one_day_sales,
        }
    }
}
export const OpenSea = new OpenSeaAPI()
