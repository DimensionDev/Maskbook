async function query(data: any) {
    const endpiont =
        process.env.NODE_ENV === 'production'
            ? 'https://api.cybertino.io/connect/'
            : 'https://api.stg.cybertino.io/connect/'
    const res = await fetch(endpiont, {
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
export async function fetchIdentity(address: string) {
    const data = {
        query: `query Identity($address: String!, $first: Int, $after: String) {
        identity(address: $address) {
            address
            ens
            followerCount(namespace:"")
            followingCount(namespace:"")
            followings(first: $first, after: $after){
                list {
                    address
                    ens
                    alias
                    namespace
                }
            }
            followers(first: $first, after: $after){
                list {
                    address
                    ens
                    alias
                    namespace
                }
            }
        }
    }`,
        variables: {
            address,
            first: 100,
            after: '',
        },
    }
    const res = await query(data)
    return res
}
export async function fetchFollowStatus(fromAddr: string, toAddr: string) {
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
            fromAddr,
            toAddr,
        },
    }
    const res = await query(data)
    return res
}
