export enum FollowModuleType {
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
    RelayerResult = 'RelayerResult',
    RelayError = 'RelayError',
}

export namespace LensBaseAPI {
    export interface Profile {
        id: string
        handle: string
        ownedBy: string
        name: string
        picture?: {
            original?: {
                url: string
            }
        }
        stats: {
            totalFollowers: number
            totalFollowing: number
        }
        followModule?: {
            type: FollowModuleType
            contractAddress?: string
            amount?: {
                asset: {
                    name: string
                    symbol: string
                    decimals: number
                    address: string
                }
                value: string
            }
            recipient: string
        }
    }

    export interface DoesFollow {
        followerAddress: string
        profileId: string
        follows: boolean
    }

    export interface Challenge {
        text: string
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
                FollowWithSig: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                profileIds: string[]
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
                BurnWithSig: Array<{
                    name: string
                    type: string
                }>
            }
            value: {
                nonce: number
                deadline: number
                tokenId: string
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

    export interface RelayerResult {
        txHash: string
        __typename: BroadcastType.RelayerResult
    }

    export interface RelayError {
        reason: string
        __typename: BroadcastType.RelayError
    }

    export type Broadcast = RelayerResult | RelayError

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
