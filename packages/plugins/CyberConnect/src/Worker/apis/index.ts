import { createIndicator, createNextIndicator, createPageable, HubIndicator, Pageable } from '@masknet/web3-shared-base'
import { PageSize, ProfileTab } from '../../constants.js'

export interface IQuery {
    query: string
    variables: Record<string, string | number>
}

export interface IFollowIdentity {
    address: string
    ens: string
    namespace: string
}
export interface IFollowPageInfo {
    endCursor: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    startCursor: number
}

export interface IIdentity {
    address: string
    avatar: string
    domain: string
    ens: string
    followerCount: number
    followingCount: number
    followers: {
        list: IFollowIdentity[]
    }
    followings: {
        list: IFollowIdentity[]
    }
}
export interface IFollowStatus {
    isFollowing: boolean
    isFollowed: boolean
}
async function query(data: IQuery) {
    const url =
        process.env.NODE_ENV === 'production'
            ? 'https://api.cybertino.io/connect/'
            : 'https://api.stg.cybertino.io/connect/'

    const res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
            'Content-Type': 'application/json',
        },
        referrerPolicy: 'no-referrer',
        body: JSON.stringify(data),
    })
    return res.json()
}
export async function fetchIdentity(address: string): Promise<{ data: { identity: IIdentity } }> {
    const data = {
        query: `query QueryForENS {
        identity(address: "${address.toLowerCase()}") {
            address
            ens
            domain
            avatar
        }
    }`,
        variables: {},
    }
    const res = await query(data)
    return res
}

export async function fetchFollowers(
    category: ProfileTab,
    address: string,
    size: number,
    indicator?: HubIndicator,
): Promise<Pageable<IFollowIdentity>> {
    if (!address) return createPageable([], createIndicator(indicator))
    const data = {
        query: `query FullIdentityQuery {
        identity(address: "${address.toLowerCase()}") {
                ${category.toLowerCase()}(first: ${size > PageSize ? PageSize : size}, after: "${indicator?.id ?? 0}"){
                pageInfo {
                    hasNextPage
                    hasPreviousPage
                    endCursor
                    startCursor
                }
                list {
                    address
                    ens
                    namespace
                }
            }
        }
    }`,
        variables: {},
    }
    const res = await query(data)
    if (category === ProfileTab.Followings)
        return createPageable(
            res.data.identity.followings.list,
            createIndicator(indicator),
            res.data.identity.followings.pageInfo.hasNextPage
                ? createNextIndicator(indicator, res.data.identity.followings.pageInfo.startCursor)
                : undefined,
        )
    return createPageable(
        res.data.identity.followers.list,
        createIndicator(indicator),
        res.data.identity.followers.pageInfo.hasNextPage
            ? createNextIndicator(indicator, res.data.identity.followers.pageInfo.startCursor)
            : undefined,
    )
}

export async function fetchFollowStatus(
    fromAddr: string,
    toAddr: string,
): Promise<{ data: { followStatus: IFollowStatus } }> {
    const data = {
        query: `query FollowStatus(
            $fromAddr: String!
            $toAddr: String!
          ) {
            followStatus(fromAddr: $fromAddr, toAddr: $toAddr, namespace: "Mask") {
              isFollowed
              isFollowing
            }
          }`,
        variables: {
            fromAddr: fromAddr.toLowerCase(),
            toAddr: toAddr.toLowerCase(),
        },
    }
    const res = await query(data)
    return res
}
