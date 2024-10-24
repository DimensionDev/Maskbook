import urlcat from 'urlcat'
import {
    createIndicator,
    createNextIndicator,
    createPageable,
    EMPTY_LIST,
    type Pageable,
    type PageIndicator,
} from '@masknet/shared-base'
import { fetchJSON } from '../helpers/fetchJSON.js'
import type { FireflyConfigAPI } from '../entry-types.js'
import { compact, first } from 'lodash-es'
import { resolveChainId } from '../SimpleHash/helpers.js'
import type { NonFungibleCollection } from '@masknet/web3-shared-base'
import { SchemaType, type ChainId } from '@masknet/web3-shared-evm'

const BASE_URL = 'https://api.dimension.im/v1'
const TWITTER_HANDLER_VERIFY_URL = 'https://twitter-handler-proxy.r2d2.to'
const FIREFLY_BASE_URL = 'https://api.firefly.land'

export class FireflyConfig {
    static async getLensByTwitterId(
        twitterHandle?: string,
        isVerified = true,
    ): Promise<FireflyConfigAPI.LensAccount[]> {
        if (!twitterHandle) return EMPTY_LIST
        const result = await fetchJSON<FireflyConfigAPI.LensResult>(
            urlcat(BASE_URL, '/account/lens', {
                twitterHandle,
                isVerified,
            }),
        )
        if (result.code !== 200) return EMPTY_LIST
        return result.data
    }

    static async getVerifiedHandles(address: string) {
        const response = await fetchJSON<FireflyConfigAPI.VerifyTwitterResult>(
            urlcat(TWITTER_HANDLER_VERIFY_URL, '/v1/relation/handles', {
                wallet: address.toLowerCase(),
                isVerified: true,
            }),
        )
        if ('error' in response) return []
        return response.data
    }

    /**
     * @see https://www.notion.so/mask/v2-wallet-profile-f1cc2b3cd9dc49119cf493ae8a59dde9?pvs=4
     */
    static async getUnionProfile(
        profileOptions: FireflyConfigAPI.UnionProfileOptions,
    ): Promise<FireflyConfigAPI.UnionProfile> {
        const url = urlcat(FIREFLY_BASE_URL, 'v2/wallet/profile', profileOptions)
        const response = await fetchJSON<FireflyConfigAPI.UnionProfileResponse>(url)
        return response.data
    }

    static async getCollectionsByOwner(
        account: string,
        indicator?: PageIndicator,
    ): Promise<Pageable<NonFungibleCollection<ChainId, SchemaType>, PageIndicator>> {
        const url = urlcat(FIREFLY_BASE_URL, '/v2/user/walletsNftCollections', {
            cursor: indicator?.id ? indicator.id : undefined,
            size: 50,
            walletAddresses: account,
        })

        const response = await fetchJSON<FireflyConfigAPI.CollectionsResponse>(url)

        const data = compact(
            response.data.collections.map((collection) => {
                const target = first(collection.collection_details.top_contracts)
                if (!target) return

                const [chain, address] = target.split('.')
                const chainId = resolveChainId(chain)
                if (!chainId) return
                return {
                    name: collection.collection_details.name,
                    slug: collection.collection_details.name,
                    description: collection.collection_details.description,
                    address,
                    chainId,
                    iconURL: collection.collection_details.image_url,
                    schema: SchemaType.ERC721,
                }
            }),
        )

        return createPageable(
            data,
            indicator ?? createIndicator(undefined),
            response.data.cursor ? createNextIndicator(indicator, response.data.cursor) : undefined,
        )
    }
}
