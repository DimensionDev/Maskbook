export interface IQuery {
    query: string
    variables: Record<string, string | number>
}

export interface IFollowIdentity {
    address: string
    ens: string
    namespace: string
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
        query: `query Identity($address: String!, $first: Int, $after: String) {
        identity(address: $address) {
            address
            ens
            domain
            avatar
            followerCount(namespace:"")
            followingCount(namespace:"")
            followings(first: $first, after: $after){
                list {
                    address
                    ens
                    namespace
                }
            }
            followers(first: $first, after: $after){
                list {
                    address
                    ens
                    namespace
                }
            }
        }
    }`,
        variables: {
            address: address.toLowerCase(),
            first: 100,
            after: '',
        },
    }
    const res = await query(data)
    return res
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
