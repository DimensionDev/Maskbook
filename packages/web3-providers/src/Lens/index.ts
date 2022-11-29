import type { LensBaseAPI } from '../types/lens.js'
import { LENS_ROOT_API } from './constants.js'

export class LensAPI implements LensBaseAPI.Provider {
    async getProfileByHandle(handle: string): Promise<LensBaseAPI.Profile> {
        const response = await fetch(LENS_ROOT_API, {
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
        const json: { data: { profile: LensBaseAPI.Profile } } = await response.json()
        return json.data.profile
    }
}
