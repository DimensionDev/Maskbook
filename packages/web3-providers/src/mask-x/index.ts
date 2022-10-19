import urlcat from 'urlcat'
import { resolveCrossOriginURL } from '@masknet/web3-shared-base'
import { MaskX_BaseAPI } from '../types/MaskX.js'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'

export class MaskX_API implements MaskX_BaseAPI.Provider {
    private async fetchFromMaskX(pathname: string) {
        const response = await fetch(resolveCrossOriginURL(urlcat(MASK_X_ROOT_URL, pathname))!)
        const json = await response.json()
        return json as MaskX_BaseAPI.Response
    }

    private getOptions({ size = 20, page = 1 }: MaskX_BaseAPI.Options = MASK_X_DEFAULT_PAGINATION) {
        return {
            size,
            page,
        }
    }

    private getResponse(response: MaskX_BaseAPI.Response) {
        return {
            ...response,
            records: response.records.map((x) => {
                switch (x.source) {
                    case MaskX_BaseAPI.SourceType.RSS3:
                        const handle = x.sns_handle.toLowerCase()
                        return {
                            ...x,
                            // add .rss3 suffix
                            sns_handle: handle.endsWith('.rss3') ? handle : `${handle}.rss`,
                        }
                    default:
                        return {
                            ...x,
                            sns_handle: x.web3_addr,
                        }
                }
            }),
        }
    }

    async getIdentitiesExact(
        handle: string,
        platform: MaskX_BaseAPI.PlatformType,
        initial: MaskX_BaseAPI.Options = { size: 20, page: 1 },
    ): Promise<MaskX_BaseAPI.Response> {
        const response = await this.fetchFromMaskX(
            urlcat('/v1/identity', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
        return this.getResponse(response)
    }
    async getIdentitiesFuzzy(
        handle: string,
        platform: MaskX_BaseAPI.PlatformType,
        initial: MaskX_BaseAPI.Options = { size: 20, page: 1 },
    ): Promise<MaskX_BaseAPI.Response> {
        const response = await this.fetchFromMaskX(
            urlcat('/v1/identity/search', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
        return this.getResponse(response)
    }
    async getAllIdentities(initial: MaskX_BaseAPI.Options = { size: 20, page: 1 }): Promise<MaskX_BaseAPI.Response> {
        const response = await this.fetchFromMaskX(urlcat('/v1/identity/all', this.getOptions(initial)))
        return this.getResponse(response)
    }
}
