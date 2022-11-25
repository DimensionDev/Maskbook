import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { resolveCrossOriginURL } from '@masknet/web3-shared-base'
import { RSS3API } from '../RSS3/index.js'
import { MaskX_BaseAPI } from '../types/MaskX.js'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'

export class MaskX_API implements MaskX_BaseAPI.Provider {
    private RSS3 = new RSS3API()

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

    private async getRNSIdentity(identity: MaskX_BaseAPI.Identity) {
        const handle = identity.sns_handle.toLowerCase()
        if (handle.endsWith('.rss3')) {
            return {
                ...identity,
                sns_handle: handle,
            }
        }

        try {
            const nameInfo = await this.RSS3.getNameInfo(handle)
            if (!nameInfo?.rnsName) throw new Error('Failed to fetch RNS name.')

            return {
                ...identity,
                sns_handle: nameInfo.rnsName,
            }
        } catch (error) {
            return {
                ...identity,
                sns_handle: identity.web3_addr,
            }
        }
    }

    private async getResponse(response: MaskX_BaseAPI.Response) {
        const allSettled = await Promise.allSettled(
            response.records.map(async (x) => {
                switch (x.source) {
                    case MaskX_BaseAPI.SourceType.RSS3:
                        return this.getRNSIdentity(x)
                    default:
                        return {
                            ...x,
                            sns_handle: x.web3_addr,
                        }
                }
            }),
        )

        return {
            ...response,
            records: compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))),
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
