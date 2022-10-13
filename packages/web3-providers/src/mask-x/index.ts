import urlcat from 'urlcat'
import type { MaskX_BaseAPI } from '../types/MaskX.js'
import { MASK_X_DEFAULT_PAGINATION, MASK_X_ROOT_URL } from './constants.js'

export class MaskX_API implements MaskX_BaseAPI.Provider {
    private async fetchFromMaskX(pathname: string) {
        const response = await fetch(urlcat(MASK_X_ROOT_URL, pathname))
        const json = await response.json()
        return json as MaskX_BaseAPI.Response
    }

    private getOptions({ size = 20, page = 1 }: MaskX_BaseAPI.Options = MASK_X_DEFAULT_PAGINATION) {
        return {
            size,
            page,
        }
    }

    getIdentitiesExact(
        handle: string,
        platform: MaskX_BaseAPI.PlatformType,
        initial: MaskX_BaseAPI.Options = { size: 20, page: 1 },
    ): Promise<MaskX_BaseAPI.Response> {
        return this.fetchFromMaskX(
            urlcat('/v1/identity', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
    }
    getIdentitiesFuzzy(
        handle: string,
        platform: MaskX_BaseAPI.PlatformType,
        initial: MaskX_BaseAPI.Options = { size: 20, page: 1 },
    ): Promise<MaskX_BaseAPI.Response> {
        return this.fetchFromMaskX(
            urlcat('/v1/identity/search', {
                identity: handle,
                platform,
                ...this.getOptions(initial),
            }),
        )
    }
    getAllIdentities(initial: MaskX_BaseAPI.Options = { size: 20, page: 1 }): Promise<MaskX_BaseAPI.Response> {
        return this.fetchFromMaskX(urlcat('/v1/identity/all', this.getOptions(initial)))
    }
}
