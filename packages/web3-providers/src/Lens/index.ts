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
            headers: {
                'Content-Type': 'application/json',
            },
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

    async queryChallenge(address: string) {
        if (!isValidAddress(address)) return ''
        const { data } = await fetchJSON<{ data: { challenge: LensBaseAPI.Challenge } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Challenge {
                  challenge(request: { address: "${address}" }) {
                    text
                  }
                }`,
            }),
        })

        return data.challenge.text
    }

    async authenticate(address: string, signature: string) {
        if (!isValidAddress(address) || !signature) return
        const { data } = await fetchJSON<{ data: { authenticate: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation Authenticate {
                  authenticate(
                    request: {
                      address: "${address}"
                      signature: "${signature}"
                    }
                  ) {
                    accessToken
                    refreshToken
                  }
                }
                `,
            }),
        })

        return data.authenticate
    }

    async refresh(refreshToken: string) {
        if (!refreshToken) return
        const { data } = await fetchJSON<{ data: { refresh: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation Refresh {
                  refresh(request: {
                    refreshToken: "${refreshToken}"
                  }) {
                    accessToken
                    refreshToken
                  }
                }
              `,
            }),
        })

        return data.refresh
    }

    // TODO: follow module
    async createFollowTypedData(
        profileId: string,
        options?: {
            token: string
        },
    ) {
        if (!profileId) return
        const { data } = await fetchJSON<{ data: { createFollowTypedData: LensBaseAPI.CreateFollowTypedData } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `mutation CreateFollowTypedData {
                      createFollowTypedData(
                        request: { follow: [{ profile: "${profileId}", followModule: null }] }
                      ) {
                        id
                        expiresAt
                        typedData {
                          domain {
                            name
                            chainId
                            version
                            verifyingContract
                          }
                          types {
                            FollowWithSig {
                              name
                              type
                            }
                          }
                          value {
                            nonce
                            deadline
                            profileIds
                            datas
                          }
                        }
                      }
                    }  
                  `,
                }),
            },
        )

        return data.createFollowTypedData
    }
}
