export enum FollowModuleType {
    UnknownFollowModule = 'UnknownFollowModule',
    FeeFollowModule = 'FeeFollowModule',
    ProfileFollowModule = 'ProfileFollowModule',
    RevertFollowModule = 'RevertFollowModule',
}

export type FollowModuleTypedData = {
    profileFollowModule?: {
        profileId: string
    }

    feeFollowModule?: {
        currency: string
        value: string
    }
}

export enum ProxyActionType {
    ProxyActionError = 'ProxyActionError',
    ProxyActionQueued = 'ProxyActionQueued',
    ProxyActionStatusResult = 'ProxyActionStatusResult',
}

export enum BroadcastType {
    RelaySuccess = 'RelaySuccess',
    RelayError = 'RelayError',
}

export enum LimitType {
    Ten = 'Ten',
    TwentyFive = 'TwentyFive',
    Fifty = 'Fifty',
}

export namespace LensBaseAPI {
    export interface Profile {
        id: string
        signless: boolean
        handle: {
            localName: string
            fullHandle: string
            id: string
            namespace: string
        }
        ownedBy: {
            address: string
            chainId: number
        }
        metadata?: {
            bio: string
            displayName: string
            picture?: {
                optimized: {
                    uri: string
                }
            }
            coverPicture?: {
                optimized: {
                    uri: string
                }
            }
        }
        stats: {
            followers: number
            following: number
        }
        followModule?: {
            type: FollowModuleType
            contract?: {
                address: string
            }
            amount?: {
                asset: {
                    name: string
                    symbol: string
                    decimals: number
                    contract: {
                        address: string
                    }
                }
                value: string
            }
            recipient: string
        }
    }

    export interface FollowStatusBulk {
        follower: string
        profileId: string
        status: {
            isFinalisedOnchain: boolean
            value: boolean
        }
    }

    export interface Challenge {
        text: string
        id: string
    }

    export interface Authenticate {
        accessToken: string
        refreshToken: string
    }

    export interface CreateFollowTypedData {
        id: string
        expiresAt: string
        typedData: {
            domain: {
                name: string
                chainId: number
                version: string
                verifyingContract: string
            }
            types: {
                Follow: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                followTokenIds: string[]
                followerProfileId: string
                idsOfProfilesToFollow: string[]
                datas: string[]
            }
        }
    }

    export interface CreateUnfollowTypedData {
        id: string
        expiresAt: string
        typedData: {
            domain: {
                name: string
                chainId: number
                version: string
                verifyingContract: string
            }
            types: {
                Unfollow: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                idsOfProfilesToUnfollow: string[]
                unfollowerProfileId: string
            }
        }
    }

    export interface ProxyActionError {
        reason: string
        lastKnownTxId: string
        __typename: ProxyActionType.ProxyActionError
    }

    export interface ProxyActionQueued {
        queuedAt: string
        __typename: ProxyActionType.ProxyActionQueued
    }

    export interface ProxyActionStatusResult {
        txHash: string
        txId: string
        status: string
        __typename: ProxyActionType.ProxyActionStatusResult
    }

    export type ProxyActionStatus = ProxyActionError | ProxyActionQueued | ProxyActionStatusResult

    export interface RelaySuccess {
        txHash: string
        __typename: BroadcastType.RelaySuccess
    }

    export interface RelayError {
        reason: string
        __typename: BroadcastType.RelayError
    }

    export type Broadcast = RelaySuccess | RelayError

    export interface ApprovedModuleAllowanceAmount {
        allowance: string
        contractAddress: string
        currency: string
        module: string
    }
    export interface TransactionPublication {
        publicationId: string
    }

    export interface Provider {
        getProfileByHandle: (handle: string) => Promise<Profile>
        queryDefaultProfileByAddress: (address: string) => Promise<Profile | undefined>
        queryProfilesByAddress: (address: string) => Promise<Profile[]>
        queryFollowStatus: (address: string, profileId: string) => Promise<boolean | undefined>
        queryChallenge: (address: string) => Promise<string>
        authenticate: (address: string, signature: string) => Promise<Authenticate | undefined>
        refresh: (refreshToken: string) => Promise<Authenticate | undefined>
        createFollowTypedData: (
            profileId: string,
            options: { token: string; followModule?: FollowModuleTypedData },
        ) => Promise<CreateFollowTypedData | undefined>
        createUnfollowTypedData: (
            profileId: string,
            options: { token: string },
        ) => Promise<CreateUnfollowTypedData | undefined>
        followWithProxyAction: (profileId: string, options: { token: string }) => Promise<string | undefined>
        queryProxyStatus: (proxyActionId: string, options: { token: string }) => Promise<ProxyActionStatus | undefined>
        broadcast: (
            id: string,
            signature: string,
            options: {
                token: string
                fetcher: <T>(input: RequestInfo | URL, init?: RequestInit | undefined) => Promise<T>
            },
        ) => Promise<Broadcast | undefined>
        queryApprovedModuleAllowanceAmount: (
            currency: string,
            options?: { token: string },
        ) => Promise<ApprovedModuleAllowanceAmount | undefined>
        queryTransactionPublicationId: (txId: string) => Promise<string | undefined>
    }
}
