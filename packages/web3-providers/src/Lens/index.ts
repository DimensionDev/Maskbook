import { isSameAddress } from '@masknet/web3-shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
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
                      name
                      picture {
                        ...on MediaSet {
                            original {
                                url
                            }
                        }
                      }
                      stats {
                        totalFollowers
                        totalFollowing
                      }
                    }
                  }`,
            }),
        })
        return data.profile
    }

    async queryFollowStatus(address: string, profileId: string) {
        if (!isValidAddress(address) || !profileId) return false

        const { data } = await fetchJSON<{ data: { doesFollow: LensBaseAPI.DoesFollow[] } }>(LENS_ROOT_API, {
            method: 'POST',
            body: JSON.stringify({
                query: `query DoesFollow {
            doesFollow(request: {
              followInfos: [
                {
                  followerAddress: "${address}", 
                  profileId: "${profileId}"
                }
              ]
            }) {
              followerAddress
              profileId
              follows
            }
          }`,
            }),
        })

        if (!data.doesFollow.length) return false

        const result: LensBaseAPI.DoesFollow | undefined = data.doesFollow.find((x) =>
            isSameAddress(x.followerAddress, address),
        )

        return result?.follows
    }
}
