import {
    createIndicator,
    createNextIndicator,
    createPageable,
    type PageIndicator,
    type Pageable,
} from '@masknet/shared-base'
import { PageSize, ProfileTab } from '../../constants.js'

interface IQuery {
    query: string
    variables: Record<string, string | number>
}

export interface IFollowIdentity {
    address: string
    ens: string
    namespace: string
}

interface IIdentity {
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
interface IFollowStatus {
    isFollowing: boolean
    isFollowed: boolean
}
async function query(data: IQuery) {
    const url =
        process.env.NODE_ENV === 'production' ?
            'https://api.cybertino.io/connect/'
        :   'https://api.stg.cybertino.io/connect/'

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
    indicator?: PageIndicator,
): Promise<Pageable<IFollowIdentity>> {
    const data = {
        query: `query FullIdentityQuery {
        identity(address: "${address.toLowerCase()}") {
                ${category.toLowerCase()}(first: ${Math.min(size, PageSize)}, after: "${
                    Number.parseInt(indicator?.id ?? '0', 10) - 1
                }"){
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
            res.data.identity.followings.pageInfo.hasNextPage ?
                createNextIndicator(indicator, res.data.identity.followings.pageInfo.endCursor)
            :   undefined,
        )
    return createPageable(
        res.data.identity.followers.list,
        createIndicator(indicator),
        res.data.identity.followers.pageInfo.hasNextPage ?
            createNextIndicator(indicator, res.data.identity.followers.pageInfo.endCursor)
        :   undefined,
    )
}

export async function fetchFollowStatus(fromAddr: string, toAddr: string): Promise<IFollowStatus> {
    const data = {
        query: `query FollowStatusQuery {
            connections(
                fromAddr: "${fromAddr}"
                toAddrList: ["${toAddr}"]
                network: ETH
            ) {
                fromAddr
                toAddr
                followStatus {
                    isFollowed
                    isFollowing
                }
            }
        }`,
        variables: {},
    }
    const res = await query(data)
    return res.data.connections[0]?.followStatus ?? { isFollowed: false, isFollowing: false }
}
