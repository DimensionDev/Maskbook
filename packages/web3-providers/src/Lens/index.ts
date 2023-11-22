import { NameServiceID } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { first } from 'lodash-es'
import { LimitType, type FollowModuleTypedData, type LensBaseAPI } from '../entry-types.js'
import { fetchJSON } from '../helpers/fetchJSON.js'
import { LENS_ROOT_API } from './constants.js'

const LensProfileQuery = `
          id
          handle {
              localName
              fullHandle
              id
              namespace
          }
          ownedBy {
              address
              chainId
          }
          signless
          metadata {
              bio
              displayName
              picture {
                  ... on ImageSet {
                      optimized {
                          uri
                      }
                      raw {
                          uri
                      }
                  }
                  ... on NftImage {
                      image {
                          raw {
                              uri
                          }
                      }
                  }
              }

              coverPicture {
                  ... on ImageSet {
                      optimized {
                          uri
                      }
                      raw {
                          uri
                      }
                  }
              }
          }
          stats {
              followers
              following
          }
          followModule {
              ... on FeeFollowModuleSettings {
                  type
                  contract {
                      address
                  }
                  amount {
                      asset {
                          ... on Erc20 {
                              name
                              symbol
                              decimals
                              contract {
                                  address
                              }
                          }
                      }
                      value
                  }
                  recipient
              }
              ... on UnknownFollowModuleSettings {
                  type
              }
              ... on RevertFollowModuleSettings {
                  type
              }
          }
`

export class LensAPI {
    static readonly id = NameServiceID.Lens
    async getProfileByHandle(handle: string): Promise<LensBaseAPI.Profile> {
        const { data } = await fetchJSON<{ data: { profile: LensBaseAPI.Profile } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query Profile($handle: Handle) {
                        profile(request: { forHandle: $handle }) {
                            ${LensProfileQuery}
                        }
                    }
                `,
                variables: { handle: `lens/${handle.replace('.lens', '')}` },
            }),
        })
        return data.profile
    }

    async getProfilesByHandles(handles: string[]) {
        const { data } = await fetchJSON<{ data: { profiles: { items: LensBaseAPI.Profile[] } } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query Profiles($request: ProfilesRequest!) {
                        profiles(request: $request) {
                            items {
                                ${LensProfileQuery}
                            }
                        }
                    }
                  `,
                variables: {
                    request: {
                        where: {
                            handles: handles.map((x) => `lens/${x.replace('.lens', '')}`),
                        },
                        limit: LimitType.Fifty,
                    },
                },
            }),
        })
        return data.profiles.items
    }

    async queryDefaultProfileByAddress(address: string) {
        if (!isValidAddress(address)) return
        const { data } = await fetchJSON<{ data: { defaultProfile?: LensBaseAPI.Profile } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query DefaultProfile {
                  defaultProfile(request: { for: "${address}" }) {
                    ${LensProfileQuery}
                  }
                }`,
            }),
        })
        return data.defaultProfile
    }
    async reverse(address: string) {
        if (!isValidAddress(address)) return
        type Response = { data: { defaultProfile?: Pick<LensBaseAPI.Profile, 'id' | 'handle'> } }
        const { data } = await fetchJSON<Response>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query handleOfDefaultProfile {
                        defaultProfile(request: { for: "${address}" }) {
                            id
                            handle {
                                localName
                            }
                        }
                    }
                `,
                variables: { address },
            }),
        })
        return data.defaultProfile?.handle.localName
    }

    async queryProfilesByAddress(address: string) {
        if (!isValidAddress(address)) return []
        const { data } = await fetchJSON<{ data: { profiles: { items: LensBaseAPI.Profile[] } } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Profiles {
                  profiles(request: { where: { ownedBy: ["${address}"] }, limit: ${LimitType.Ten} }) {
                    items {
                      ${LensProfileQuery}
                    }
                  }
                }`,
            }),
        })

        return data.profiles.items
    }

    async queryFollowStatus(follower: string, profileId: string) {
        if (!follower || !profileId) return false

        const { data } = await fetchJSON<{ data: { followStatusBulk: LensBaseAPI.FollowStatusBulk[] } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: `query followStatusBulk {
                        followStatusBulk(
                            request: { followInfos: [{ follower: "${follower}", profileId: "${profileId}" }] }
                        ) {
                            follower
                            profileId
                            status {
                            isFinalisedOnchain
                            value
                            }
                        }
                    }
                `,
                }),
            },
        )

        if (!data.followStatusBulk.length) return false

        return data.followStatusBulk.some((x) => x.status.value)
    }

    /**
     * Query one-to-many follow relationships
     * @param follower primary profile
     * @param profileIds
     */
    async queryFollowStatusList(follower: string, profileIds: string[]) {
        if (!follower || !profileIds.length) return
        const { data } = await fetchJSON<{ data: { followStatusBulk: LensBaseAPI.FollowStatusBulk[] } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: /* GraphQL */ `
                        query followStatusBulk($request: FollowStatusBulkRequest!) {
                            followStatusBulk(request: $request) {
                                follower
                                profileId
                                status {
                                    isFinalisedOnchain
                                    value
                                }
                            }
                        }
                    `,
                    variables: {
                        request: {
                            followInfos: profileIds.map((profileId) => ({
                                follower,
                                profileId,
                            })),
                        },
                    },
                }),
            },
        )
        return data.followStatusBulk
    }

    async queryChallenge(address: string, profileId: string) {
        if (!isValidAddress(address) || !profileId) return ''
        const { data } = await fetchJSON<{ data: { challenge: LensBaseAPI.Challenge } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Challenge {
                  challenge(request: { signedBy: "${address}", for: "${profileId}" }) {
                    text
                    id
                  }
                }`,
            }),
        })

        return data.challenge
    }

    async authenticate(id: string, signature: string) {
        if (!id || !signature) return
        const { data } = await fetchJSON<{ data: { authenticate: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `mutation Authenticate {
                  authenticate(
                    request: {
                      id: "${id}"
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
                query: /* GraphQL */ `mutation Refresh {
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

    async follow(
        profileId: string,
        options: {
            token: string
            followModule?: FollowModuleTypedData
            fetcher?: <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<T>
        },
    ) {
        if (!profileId) return

        let followModule = ''
        if (options.followModule?.profileFollowModule) {
            followModule = `followModule: { profileFollowModule: { profileId: "${options.followModule.profileFollowModule.profileId}" } }`
        }

        const response = await options.fetcher?.<{ data: { follow: LensBaseAPI.Broadcast } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    mutation Follow {
                        follow(request: { follow: [{ profileId: "${profileId}", ${followModule} }] }) {
                            ... on RelaySuccess {
                                txHash
                                __typename
                            }
                            ... on LensProfileManagerRelayError {
                                reason
                                __typename
                            }
                        }
                    }
                `,
            }),
        })

        return response?.data.follow
    }

    async unfollow(
        profileId: string,
        options: {
            token: string
            fetcher?: <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<T>
        },
    ) {
        if (!profileId) return

        const response = await options.fetcher?.<{ data: { unfollow: LensBaseAPI.Broadcast } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    mutation Unfollow {
                        unfollow(request: { unfollow: ["${profileId}"] }) {
                            ... on RelaySuccess {
                                txHash
                                __typename
                            }
                            ... on LensProfileManagerRelayError {
                                reason
                                __typename
                            }
                        }
                    }
                `,
            }),
        })

        return response?.data.unfollow
    }

    async createFollowTypedData(
        profileId: string,
        options: {
            token: string
            followModule?: FollowModuleTypedData
        },
    ) {
        if (!profileId) return

        let followModule = ''
        if (options.followModule?.profileFollowModule) {
            followModule = `followModule: { profileFollowModule: { profileId: "${options.followModule.profileFollowModule.profileId}" } }`
        } else if (options.followModule?.feeFollowModule) {
            followModule = `followModule: {
              feeFollowModule: {
                amount: {
                   currency: "${options.followModule.feeFollowModule.currency}",
                   value: "${options.followModule.feeFollowModule.value}"
                }
              }
            }`
        }
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
                        request: { follow: [{ profileId: "${profileId}", ${followModule} }] }
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
                            Follow {
                              name
                              type
                            }
                          }
                          value {
                            nonce
                            deadline
                            followerProfileId
                            idsOfProfilesToFollow
                            followTokenIds
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

    async createUnfollowTypedData(profileId: string, options: { token: string }) {
        if (!profileId) return
        const { data } = await fetchJSON<{ data: { createUnfollowTypedData: LensBaseAPI.CreateUnfollowTypedData } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `mutation CreateUnfollowTypedData {
                      createUnfollowTypedData(request:{
                        unfollow: ["${profileId}"]
                      }) {
                        id
                        expiresAt
                        typedData {
                          types {
                            Unfollow {
                              name
                              type
                            }
                          }
                          domain {
                            version
                            chainId
                            name
                            verifyingContract
                          }
                          value {
                            nonce
                            deadline
                            idsOfProfilesToUnfollow
                            unfollowerProfileId
                          }
                        }
                      }
                    }  
                `,
                }),
            },
        )

        return data.createUnfollowTypedData
    }

    async broadcast(
        id: string,
        signature: string,
        options?: {
            token: string
            fetcher?: <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<T>
        },
    ) {
        if (!id || !options?.token || !signature) return
        const response = await options.fetcher?.<{ data: { broadcastOnchain: LensBaseAPI.Broadcast } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `mutation BroadcastOnchain {
                      broadcastOnchain(
                        request: {
                          id: "${id}"
                          signature: "${signature}"
                        }
                      ) {
                        ... on RelaySuccess {
                          txHash
                          __typename
                        }
                        ... on RelayError {
                          reason
                          __typename
                        }
                        __typename
                      }
                    }
                    `,
            }),
        })

        return response?.data.broadcastOnchain
    }

    async queryApprovedModuleAllowanceAmount(
        currency: string,
        options?: {
            token: string
        },
    ) {
        if (!options?.token) return
        const { data } = await fetchJSON<{
            data: { approvedModuleAllowanceAmount: LensBaseAPI.ApprovedModuleAllowanceAmount[] }
        }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `query ApprovedModuleAllowanceAmount {
              approvedModuleAllowanceAmount(request: { currencies: "${currency}", followModules: [FeeFollowModule] }) {
                currency
                module
                allowance
                contractAddress
              }
            }`,
            }),
        })

        return first(data.approvedModuleAllowanceAmount)
    }

    async queryTransactionPublicationId(txId: string) {
        const result = await fetchJSON<{
            data: { dataAvailabilityTransaction?: LensBaseAPI.TransactionPublication }
        }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query TransactionPublicationId($txId: String!) {
                        dataAvailabilityTransaction(request: { id: $txId }) {
                            ... on DataAvailabilityPost {
                                ...DAPostFields
                                __typename
                            }
                        }
                    }
                    fragment DAPostFields on DataAvailabilityPost {
                        publicationId
                        __typename
                    }
                `,
                variables: { txId },
            }),
        })

        return result?.data?.dataAvailabilityTransaction?.publicationId
    }
}
