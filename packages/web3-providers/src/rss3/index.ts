import urlcat from 'urlcat'
import RSS3 from 'rss3-next'
import { RSS3_ENDPOINT } from './constants'
import { NonFungibleTokenAPI, RSS3BaseAPI } from '../types'
import { fetchJSON } from '../helpers'

export class RSS3API implements RSS3BaseAPI.Provider, NonFungibleTokenAPI.Provider {
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
        const url = urlcat(RSS3_ENDPOINT, '/assets/list', {
            personaID: address,
            type: RSS3BaseAPI.AssetType.GitcoinDonation,
        })
        return fetchJSON<RSS3BaseAPI.GeneralAssetResponse>(url)
    }
    async getFootprints(address: string) {
        const url = urlcat(RSS3_ENDPOINT, '/assets/list', {
            personaID: address,
            type: RSS3BaseAPI.AssetType.POAP,
        })
        return fetchJSON<RSS3BaseAPI.GeneralAssetResponse>(url)
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
    async getAssets(address: string) {
        const url = urlcat(RSS3_ENDPOINT, '/assets/list', {
            personaID: address,
            type: RSS3BaseAPI.AssetType.NFT,
        })

        const { status, assets = [] } = await fetchJSON<RSS3BaseAPI.GeneralAssetResponse>(url)
        if (!status) return []
        return assets.map((asset) => {
            return {
                is_verified: false,
                is_auction: false,
                image_url: asset.info.image_preview_url ?? '',
                asset_contract: null,
                current_price: null,
                current_symbol: '',
                owner: null,
                creator: null,
                token_id: asset.id.slice(asset.id.lastIndexOf('-') + 1),
                token_address: asset.id.slice(0, Math.max(0, asset.id.indexOf('-'))),
                traits: [],
                safelist_request_status: '',
                description: '',
                name: asset.info.title ?? '',
                collection_name: asset.info.collection ?? '',
                animation_url: asset.info.animation_url ?? '',
                end_time: asset.info.end_date ? new Date(asset.info.end_date) : null,
                order_payment_tokens: [],
                offer_payment_tokens: [],
                slug: null,
                top_ownerships: [],
                response_: asset,
                last_sale: null,
            }
        })
    }
}
