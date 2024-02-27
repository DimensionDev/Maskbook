import urlcat from 'urlcat'
import { compact } from 'lodash-es'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'
import { BaseMaskX } from '../entry-types.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'

function fetchFromMaskX(pathname: string) {
    return fetchCachedJSON<BaseMaskX.Response>(urlcat(MASK_X_ROOT_URL, pathname))
}

export class MaskX {
    private static getOptions({ size = 20, page = 1 }: BaseMaskX.Options = MASK_X_DEFAULT_PAGINATION) {
        return {
            size,
            page,
        }
    }

    private static async getRNSIdentity(identity: BaseMaskX.Identity) {
        const handle = identity.sns_handle.toLowerCase()
        if (handle.endsWith('.rss3')) {
            return {
                ...identity,
                sns_handle: handle,
            }
        }

        return identity
    }

    private static async getResponse(response: BaseMaskX.Response) {
        const allSettled = await Promise.allSettled(
            response.records.map(async (x) => {
                switch (x.source) {
                    case BaseMaskX.SourceType.RSS3:
                        return this.getRNSIdentity(x)
                    default:
                        return x
                }
            }),
        )

        return {
            ...response,
            records: compact(allSettled.map((x) => (x.status === 'fulfilled' ? x.value : undefined))),
        }
    }

    static async getIdentitiesExact(
        handle: string,
        platform: BaseMaskX.PlatformType,
        initial: BaseMaskX.Options = { size: 20, page: 1 },
    ): Promise<BaseMaskX.Response> {
        const response = await fetchFromMaskX(
            urlcat('/prod/identity', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
        return this.getResponse(response)
    }

    static async getIdentitiesFuzzy(
        handle: string,
        platform: BaseMaskX.PlatformType,
        initial: BaseMaskX.Options = { size: 20, page: 1 },
    ): Promise<BaseMaskX.Response> {
        const response = await fetchFromMaskX(
            urlcat('/prod/identity/search', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
        return this.getResponse(response)
    }

    static async getAllIdentities(initial: BaseMaskX.Options = { size: 20, page: 1 }): Promise<BaseMaskX.Response> {
        const response = await fetchFromMaskX(urlcat('/prod/identity/all', this.getOptions(initial)))
        return this.getResponse(response)
    }
}
