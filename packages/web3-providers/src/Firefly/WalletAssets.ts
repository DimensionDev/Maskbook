import urlcat from 'urlcat'
import { memoize, unionWith } from 'lodash-es'
import { createIndicator, createPageable } from '@masknet/shared-base'
import {
    CurrencyType,
    type FungibleAsset,
    type FungibleToken,
    isSameAddress,
    multipliedBy,
    rightShift,
    toFixed,
    TokenType,
} from '@masknet/web3-shared-base'
import {
    ChainId,
    formatEthereumAddress,
    isNativeTokenAddress,
    isValidAddress as isValidAddressEVM,
    isValidChainId,
    SchemaType,
    ZERO_ADDRESS,
} from '@masknet/web3-shared-evm'
import type { FireflyFarcasterAPI } from '@masknet/web3-providers/types'
import { FungibleTokenAPI as EVM_FungibleTokenAPI } from '../Web3/EVM/apis/FungibleTokenAPI.js'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import { Duration } from '../helpers/fetchCached.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'
import { getNativeAssets } from '../helpers/getNativeAssets.js'
import type { BaseHubOptions, FungibleTokenAPI } from '../entry-types.js'
import { FIREFLY_BASE_URL } from './constants.js'
import { resolveFireflyResponseData } from './helpers.js'

export namespace FireflyWalletAssetsAPI {
    /** Token record from `/v1/misc/all_token_list` (Zerion-backed). */
    export interface WalletAssetRecord {
        /** Token contract address, or the chain slug for the native currency (e.g. `ethereum`). */
        id: string
        chain: string
        /** Numeric EVM chain id as a string, e.g. `56`. */
        community_id: string
        name: string
        symbol: string
        optimized_symbol?: string
        decimals: number
        logo_url: string | null
        price: number | null
        amount: number
        is_verified?: boolean
        is_core?: boolean
        is_wallet?: boolean
        protocol_id?: string
        time_at?: number | null
    }

    export type TokenListResponse = FireflyFarcasterAPI.Response<{ list: WalletAssetRecord[] }>
}

/**
 * EVM chains covered by the Firefly (Zerion-backed) asset endpoint. Balances on
 * other chains must be fetched over RPC instead.
 */
export const FIREFLY_ASSETS_SUPPORTED_CHAINS = [
    ChainId.Mainnet,
    ChainId.Optimism,
    ChainId.BSC,
    ChainId.xDai,
    ChainId.XLayer,
    ChainId.Fantom,
    ChainId.Robinhood,
    ChainId.Celo,
    ChainId.Avalanche,
    ChainId.Base,
    ChainId.Scroll,
    ChainId.Arbitrum,
    ChainId.Aurora,
    ChainId.Zora,
    ChainId.Polygon,
]

export function isFireflyAssetsSupportedChain(chainId: number) {
    return FIREFLY_ASSETS_SUPPORTED_CHAINS.includes(chainId as ChainId)
}

function formatAssets(data: FireflyWalletAssetsAPI.WalletAssetRecord[]): Array<FungibleAsset<ChainId, SchemaType>> {
    const resolveNativeAddress = memoize((chainId: ChainId) => {
        try {
            // chainId is beyond builtin chainIds
            return EVMChainResolver.nativeCurrency(chainId)?.address || ZERO_ADDRESS
        } catch {
            return ZERO_ADDRESS
        }
    })

    return (
        data
            .map((x) => ({ record: x, chainId: Number(x.community_id) }))
            // an empty community_id parses to 0, which is a valid builtin chain id, so guard it explicitly
            .filter(({ record, chainId }) => !!record.community_id && isValidChainId(chainId))
            .map(({ record: x, chainId }) => {
                // the native currency carries the chain slug as id (e.g. `ethereum`) rather than a contract address
                const isNative = x.id === x.chain || !x.id.startsWith('0x')
                const address = isNative ? resolveNativeAddress(chainId) : x.id

                return {
                    id: x.id,
                    address: formatEthereumAddress(address),
                    chainId,
                    type: TokenType.Fungible,
                    schema: isNativeTokenAddress(address) ? SchemaType.Native : SchemaType.ERC20,
                    decimals: x.decimals,
                    name: x.name,
                    symbol: x.symbol,
                    balance: rightShift(x.amount, x.decimals).toFixed(),
                    price: {
                        [CurrencyType.USD]: toFixed(x.price ?? 0),
                    },
                    value: {
                        [CurrencyType.USD]: multipliedBy(x.price ?? 0, x.amount).toFixed(),
                    },
                    logoURL: x.logo_url ?? undefined,
                }
            })
    )
}

class FireflyFungibleTokenAPI implements FungibleTokenAPI.Provider<ChainId, SchemaType> {
    private FungibleToken = new EVM_FungibleTokenAPI()

    async getAssets(address: string, options?: BaseHubOptions<ChainId>) {
        const res = await fetchCachedJSON<FireflyWalletAssetsAPI.TokenListResponse | undefined>(
            urlcat(FIREFLY_BASE_URL, '/v1/misc/all_token_list', {
                // Lowercase EVM so checksummed variants hit the same server cache; other chains stay as-is.
                address: isValidAddressEVM(address) ? address.toLowerCase() : address,
            }),
            undefined,
            {
                cacheDuration: Duration.TEN_SECONDS,
            },
        )

        // Preserve an upstream failure so the hub can try the next asset provider.
        if (!res) return

        // Spam positions are filtered server-side. `is_verified` is intentionally
        // not filtered: most real holdings from the upstream are unverified.
        const records = resolveFireflyResponseData(res)?.list ?? []
        return createPageable(
            unionWith(
                formatAssets(records),
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }

    async getTrustedAssets(
        address: string,
        trustedFungibleTokens?: Array<FungibleToken<ChainId, SchemaType>>,
        options?: BaseHubOptions<ChainId>,
    ) {
        const trustTokenAssets = await this.FungibleToken.getTrustedAssets(address, trustedFungibleTokens, options)
        return createPageable(
            unionWith(
                trustTokenAssets.data,
                getNativeAssets(),
                (a, z) => isSameAddress(a.address, z.address) && a.chainId === z.chainId,
            ),
            createIndicator(options?.indicator),
        )
    }
}
export const FireflyFungibleToken = new FireflyFungibleTokenAPI()
