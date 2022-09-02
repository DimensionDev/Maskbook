import { createIndicator, createNextIndicator, createPageable, HubOptions, TokenType } from '@masknet/web3-shared-base'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import RSS3 from 'rss3-next'
import urlcat from 'urlcat'
import { fetchJSON } from '../helpers'
import { NonFungibleTokenAPI, RSS3BaseAPI } from '../types'
import { NEW_RSS3_ENDPOINT, RSS3_ENDPOINT, TAG, TYPE } from './constants'

type RSS3Result<T> = { cursor?: string; total: number; result: T[] }

export class RSS3API implements RSS3BaseAPI.Provider, NonFungibleTokenAPI.Provider<ChainId, SchemaType> {
    createRSS3(
        address: string,
        sign: (message: string) => Promise<string> = () => {
            throw new Error('Not supported.')
        },
    ): RSS3 {
        return new RSS3({
            endpoint: RSS3_ENDPOINT,
            address,
            sign,
        })
    }
    async getFileData<T>(rss3: RSS3, address: string, key: string) {
        const file = await rss3.files.get(address)
        if (!file) throw new Error('The account was not found.')
        const descriptor = Object.getOwnPropertyDescriptor(file, key)
        return descriptor?.value as T | undefined
    }
    async setFileData<T>(rss3: RSS3, address: string, key: string, data: T): Promise<T> {
        const file = await rss3.files.get(address)
        if (!file) throw new Error('The account was not found.')
        const descriptor = Object.getOwnPropertyDescriptor(file, key)
        const value = {
            ...(descriptor?.value as T | undefined),
            ...data,
        }
        rss3.files.set(Object.assign(file, { [key]: value }))
        await rss3.files.sync()
        return value as T
    }
    async getDonations(address: string, { indicator, size = 100 }: HubOptions<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, address, {
            tag: TAG.donation,
            type: TYPE.donate,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { result: donations, cursor } = await fetchJSON<RSS3Result<RSS3BaseAPI.Donation>>(collectionURL)
        // A donation Feed contains multiple donation Actions. Let's flatten them.
        const result = donations.flatMap((donation) => {
            return donation.actions.map((action) => ({
                ...donation,
                actions: [action],
            }))
        })
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
    async getFootprints(address: string, { indicator, size = 100 }: HubOptions<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, address, {
            tag: TAG.collectible,
            type: TYPE.poap,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { result, cursor } = await fetchJSON<RSS3Result<RSS3BaseAPI.Footprint>>(collectionURL)
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
    async getNameInfo(id: string) {
        if (!id) return
        const url = urlcat('https://rss3.domains/name/:id', { id })
        return fetchJSON<RSS3BaseAPI.NameInfo>(url)
    }
    async getProfileInfo(address: string) {
        if (!address) return

        const url = urlcat(RSS3_ENDPOINT, '/:address', { address })
        const rsp = await fetchJSON<{
            profile: RSS3BaseAPI.ProfileInfo
        }>(url)
        return rsp?.profile
    }
    async getAssets(address: string, { chainId, indicator, size = 50 }: HubOptions<ChainId> = {}) {
        if (chainId !== ChainId.Mainnet && chainId !== ChainId.Matic)
            return createPageable([], createIndicator(indicator))

        const url = urlcat(RSS3_ENDPOINT, '/assets/list', {
            personaID: address,
            type: RSS3BaseAPI.AssetType.NFT,
        })

        const { status, assets = [] } = await fetchJSON<RSS3BaseAPI.GeneralAssetResponse>(url)
        if (!status) return createPageable([], createIndicator(indicator))

        const data = assets
            .filter((x) => ['Ethereum-NFT', 'Polygon-NFT'].includes(x.type))
            .map((asset) => {
                const [address, tokenId] = asset.id.split('-')
                const chainId = asset.type === 'Ethereum-NFT' ? ChainId.Mainnet : ChainId.Matic
                return {
                    id: asset.id,
                    type: TokenType.NonFungible,
                    schema: SchemaType.ERC721,
                    chainId,
                    address,
                    tokenId,
                    collection: {
                        chainId,
                        name: asset.info.collection ?? '',
                        slug: '',
                    },
                }
            })
            .filter((x) => x.chainId === chainId)
        return createPageable(data, createIndicator(indicator))
    }

    /**
     * Get feeds in tags of donation, collectible and transaction
     */
    async getWeb3Feeds(address: string, { indicator, size = 100 }: HubOptions<ChainId> = {}) {
        if (!address) return createPageable([], createIndicator(indicator))
        const tags = [RSS3BaseAPI.Tag.Donation, RSS3BaseAPI.Tag.Collectible, RSS3BaseAPI.Tag.Transaction]
        const url = urlcat(NEW_RSS3_ENDPOINT, `/:address?tag=${tags.join('&tag=')}`, {
            address,
            limit: size,
            cursor: indicator?.id,
            include_poap: true,
        })
        const { result, cursor } = await fetchJSON<{ result: RSS3BaseAPI.Activity[]; cursor?: string }>(url)
        return createPageable(result, createIndicator(indicator), createNextIndicator(indicator, cursor))
    }
}
