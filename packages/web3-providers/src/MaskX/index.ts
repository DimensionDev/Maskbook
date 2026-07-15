import urlcat from 'urlcat'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'
import { BaseMaskX } from '../entry-types.js'
import { fetchCachedJSON } from '../helpers/fetchJSON.js'

function fetchFromMaskX(pathname: string) {
    return fetchCachedJSON<BaseMaskX.Response>(urlcat(MASK_X_ROOT_URL, pathname))
}

function getOptions({ size = 20, page = 1 }: BaseMaskX.Options = MASK_X_DEFAULT_PAGINATION) {
    return {
        size,
        page,
    }
}

function getRNSIdentity(identity: BaseMaskX.Identity) {
    const handle = identity.sns_handle.toLowerCase()
    if (handle.endsWith('.rss3')) {
        return {
            ...identity,
            sns_handle: handle,
        }
    }
    return identity
}

function getResponse(response: BaseMaskX.Response) {
    const allSettled = response.records.map((x) => {
        switch (x.source) {
            case BaseMaskX.SourceType.RSS3:
                return getRNSIdentity(x)
            default:
                return x
        }
    })

    return {
        ...response,
        records: allSettled,
    }
}
export const MaskX = {
    async getIdentitiesExact(
        handle: string,
        platform: BaseMaskX.PlatformType,
        initial?: BaseMaskX.Options,
    ): Promise<BaseMaskX.Response> {
        const response = await fetchFromMaskX(
            urlcat('/prod/identity', {
                identity: handle,
                platform,
                ...getOptions(initial || { size: 20, page: 1 }),
            }),
        )
        return getResponse(response)
    },
}
