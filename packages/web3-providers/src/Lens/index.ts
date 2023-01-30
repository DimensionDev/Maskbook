import { fetchJSON } from '../entry-helpers.js'
import type { LensBaseAPI } from '../types/Lens.js'
import { LENS_ROOT_API } from './constants.js'

export class LensAPI implements LensBaseAPI.Provider {
    async getProfileByHandle(handle: string): Promise<LensBaseAPI.Profile> {
        const { data } = await fetchJSON<{ data: { profile: LensBaseAPI.Profile } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Profile {
                    profile(request: { handle: "${handle}" }) {
                      id
                      handle
                      ownedBy
                    }
                  }`,
            }),
        })
        return data.profile
    }
}
