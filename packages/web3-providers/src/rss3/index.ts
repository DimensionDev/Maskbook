import urlcat from 'urlcat'
import RSS3 from 'rss3-next'
import { ChainId, SchemaType } from '@masknet/web3-shared-evm'
import { NETWORK_PLUGIN, NEW_RSS3_ENDPOINT, RSS3_ENDPOINT, RSS3_FEED_ENDPOINT, TAG, TYPE } from './constants'
import { NonFungibleTokenAPI, RSS3BaseAPI } from '../types'
import { fetchJSON } from '../helpers'
import {
    createIndicator,
    createPageable,
    HubOptions,
    leftShift,
    NetworkPluginID,
    TokenType,
} from '@masknet/web3-shared-base'
import { first } from 'lodash-unified'

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
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, address, {
            tag: TAG.donation,
            type: TYPE.donate,
            include_poap: true,
        })
        const res = await fetchJSON<{ result: RSS3BaseAPI.CollectionResponse[] }>(collectionURL)
        return createCollection(res.result)
    }
    async getFootprints(address: string) {
        if (!address) return
        const collectionURL = urlcat(NEW_RSS3_ENDPOINT, address, {
            tag: TAG.collectible,
            type: TYPE.poap,
            include_poap: true,
        })
        const res = await fetchJSON<{ result: RSS3BaseAPI.CollectionResponse[] }>(collectionURL)
        return createCollection(res.result)
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
        const url = `${RSS3_FEED_ENDPOINT}account:${address}@${NETWORK_PLUGIN[networkPluginId]}/notes?limit=100&exclude_tags=POAP&tags=Gitcoin&tags=POAP&tags=NFT&tags=Donation&latest=false`
        const res = fetchJSON<RSS3BaseAPI.Web3FeedResponse>(url)
        return res
    }
}

const getIdFromDonationURL = (url?: string) => {
    if (!url) return
    return url?.match(/(?<=https:\/\/gitcoin.co\/grants)\d+/g)?.[0]
}

const createCollection = (collectionResponse: RSS3BaseAPI.CollectionResponse[]): RSS3BaseAPI.Collection[] => {
    return collectionResponse.map((collection: RSS3BaseAPI.CollectionResponse) => {
        const firstAction = first(collection.actions)
        return {
            ...collection,
            title: firstAction?.metadata?.title || firstAction?.metadata?.name,
            id: firstAction?.metadata?.id ?? getIdFromDonationURL(firstAction?.related_urls?.[0]) ?? collection?.hash,
            imageURL: firstAction?.metadata?.logo ?? firstAction?.metadata?.image,
            description: firstAction?.metadata?.description,
            tokenAmount: collection.actions?.reduce((pre, cur) => {
                return (
                    pre +
                    Number(leftShift(cur?.metadata?.token?.value || '0', cur?.metadata?.token?.decimals).toFixed(4))
                )
            }, 0),
            tokenSymbol: firstAction?.metadata?.token?.symbol,
            location:
                firstAction?.metadata?.attributes?.find((trait) => trait.trait_type === 'city')?.value ||
                firstAction?.metadata?.attributes?.find((trait) => trait.trait_type === 'country')?.value ||
                'Metaverse',
        }
    })
}
