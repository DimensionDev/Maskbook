import urlcat from 'urlcat'
import RSS3 from 'rss3-next'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { PLATFORM, RSS3_ENDPOINT, CollectionType, NEW_RSS3_ENDPOINT, RSS3_FEED_ENDPOINT } from './constants'
import { NonFungibleTokenAPI, RSS3BaseAPI } from '../types'
import { fetchJSON } from '../helpers'
import { createIndicator, createPageable, HubOptions, NetworkPluginID, TokenType } from '@masknet/web3-shared-base'

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
    async getDonations(address: string) {
        if (!address) return
        const allCollectionIdURL = urlcat(NEW_RSS3_ENDPOINT, `/${address}-list-assets.auto-0`)
        const res = await fetchJSON<{ list: string[] }>(allCollectionIdURL)
        const footprints = res.list.filter((str) => !!str.match(CollectionType.donation))
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, '/assets/details', {
            assets: footprints?.join(','),
            full: 1,
        })
        const collectionRes = await fetchJSON<{ data: RSS3BaseAPI.Donation[] }>(collectionURL)
        return collectionRes.data
    }
    async getFootprints(address: string) {
        if (!address) return
        const allCollectionIdURL = urlcat(NEW_RSS3_ENDPOINT, `/${address}-list-assets.auto-0`)
        const res = await fetchJSON<{ list: string[] }>(allCollectionIdURL)
        const footprints = res.list.filter((str) => !!str.match(CollectionType.footprint))
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, '/assets/details', {
            assets: footprints?.join(','),
            full: 1,
        })
        const collectionRes = await fetchJSON<{ data: RSS3BaseAPI.Footprint[] }>(collectionURL)
        return collectionRes.data
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

    async getWeb3Feed(
        address: string,
        { networkPluginId = NetworkPluginID.PLUGIN_EVM }: HubOptions<ChainId> = {},
        type?: RSS3BaseAPI.FeedType,
    ) {
        if (!address) return
        const url = `${RSS3_FEED_ENDPOINT}account:${address}@${PLATFORM[networkPluginId]}/notes?limit=100&exclude_tags=POAP&tags=Gitcoin&tags=POAP&tags=NFT&tags=Donation&latest=false`
        const res = fetchJSON<RSS3BaseAPI.Web3FeedResponse>(url)
        return res
    }
}
