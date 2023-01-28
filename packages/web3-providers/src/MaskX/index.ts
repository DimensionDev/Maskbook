import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { RSS3API } from '../RSS3/index.js'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'
import { MaskX_BaseAPI } from '../entry-types.js'
import { fetchJSON } from '../entry-helpers.js'

export class MaskX_API implements MaskX_BaseAPI.Provider {
    private RSS3 = new RSS3API()

    private async fetchFromMaskX(pathname: string) {
        return fetchJSON<MaskX_BaseAPI.Response>(urlcat(MASK_X_ROOT_URL, pathname))
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
