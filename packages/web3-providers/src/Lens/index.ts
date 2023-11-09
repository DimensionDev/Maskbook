import { NameServiceID } from '@masknet/shared-base'
import { isValidAddress } from '@masknet/web3-shared-evm'
import { first } from 'lodash-es'
import type { FollowModuleTypedData, LensBaseAPI } from '../entry-types.js'
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

export class Lens {
    static readonly id = NameServiceID.Lens
    static async getProfileByHandle(handle: string): Promise<LensBaseAPI.Profile> {
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

    static async queryDefaultProfileByAddress(address: string) {
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
    static async reverse(address: string) {
        if (!isValidAddress(address)) return
        type Response = { data: { defaultProfile?: Pick<LensBaseAPI.Profile, 'id' | 'handle'> } }
        const { data } = await fetchJSON<Response>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: /* GraphQL */ `
                    query handleOfDefaultProfile($address: EthereumAddress!) {
                        defaultProfile(request: { ethereumAddress: $address }) {
                            id
                            handle
                        }
                    }
                `,
                variables: { address },
            }),
        })
        return data.defaultProfile?.handle
    }

    static async queryProfilesByAddress(address: string) {
        if (!isValidAddress(address)) return []
        const { data } = await fetchJSON<{ data: { profiles: { items: LensBaseAPI.Profile[] } } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `query Profiles {
                  profiles(request: { ownedBy: ["${address}"], limit: 10 }) {
                    items {
                      ${LensProfileQuery}
                    }
                  }
                }`,
            }),
        })

        return data.profiles.items
    }

    static async queryFollowStatus(follower: string, profileId: string) {
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
                    request: { followInfos: [{ follower: "${follower}", profileId: "${follower}" }] }
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

    static async queryChallenge(address: string, profileId: string) {
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
                  }
                }`,
            }),
        })

        return data.challenge.text
    }

    static async authenticate(id: string, signature: string) {
        if (!id || !signature) return
        const { data } = await fetchJSON<{ data: { authenticate: LensBaseAPI.Authenticate } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `mutation Authenticate {
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

    static async refresh(refreshToken: string) {
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

    static async createFollowTypedData(
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
                        request: { follow: [{ profile: "${profileId}", ${followModule} }] }
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

    static async createUnfollowTypedData(profileId: string, options: { token: string }) {
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
                        profile: "${profileId}"
                      }) {
                        id
                        expiresAt
                        typedData {
                          types {
                            BurnWithSig {
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
                            tokenId
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

    static async followWithProxyAction(profileId: string, options: { token: string }) {
        if (!profileId) return
        const { data } = await fetchJSON<{ data: { proxyAction: string } }>(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `mutation ProxyAction {
                  proxyAction(request: { follow: { freeFollow: { profileId: "${profileId}" } } })
                }
                `,
            }),
        })

        return data.proxyAction
    }

    static async queryProxyStatus(proxyActionId: string, options: { token: string }) {
        if (!proxyActionId) return
        const { data } = await fetchJSON<{ data: { proxyActionStatus: LensBaseAPI.ProxyActionStatus } }>(
            LENS_ROOT_API,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-access-token': options?.token ? `Bearer ${options.token}` : '',
                },
                body: JSON.stringify({
                    query: `query ProxyStatus {
                      proxyActionStatus(proxyActionId: "${proxyActionId}") {
                        ... on ProxyActionError{
                          reason
                          lastKnownTxId
                          __typename
                        }
                        ... on ProxyActionStatusResult {
                          txHash
                          txId
                          status
                          __typename
                        }
                        ... on ProxyActionQueued {
                          queuedAt
                          __typename
                        }
                      }
                    }`,
                }),
            },
        )

        return data.proxyActionStatus
    }

    static async broadcast(
        id: string,
        signature: string,
        options?: {
            token: string
            fetcher: (input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<unknown>
        },
    ) {
        if (!id || !options?.token || !signature) return
        const { data } = (await options.fetcher(LENS_ROOT_API, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-access-token': options?.token ? `Bearer ${options.token}` : '',
            },
            body: JSON.stringify({
                query: `mutation Broadcast {
                      broadcast(
                        request: {
                          id: "${id}"
                          signature: "${signature}"
                        }
                      ) {
                        ... on RelayerResult {
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
        })) as { data: { broadcast: LensBaseAPI.Broadcast } }

        return data.broadcast
    }

    static async queryApprovedModuleAllowanceAmount(
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

    static async queryTransactionPublicationId(txId: string) {
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
