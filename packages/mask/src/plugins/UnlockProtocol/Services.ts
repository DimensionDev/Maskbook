import { isSameAddress } from '@masknet/web3-shared-evm'
import { GraphQLClient, gql } from 'graphql-request'
import stringify from 'json-stable-stringify'
import urlcat from 'urlcat'
import { graphEndpointKeyVal, keyServerEndpoint } from './constants'

const graphQLClients: { [key: string]: GraphQLClient } = {}

for (const [key, url] of Object.entries(graphEndpointKeyVal)) {
    graphQLClients[key] = new GraphQLClient(url)
}

export interface verifyHolderResponse {
    keyHolders: {
        keys: {
            expiration: number
            keyId: string
            lock: {
                address: string
            }
        }[]
    }[]
}

const verifyHolder = async (_lockAddress: string, _holder: string, _chain: number): Promise<verifyHolderResponse> => {
    const query = gql`
        query keyHolders($address: String!) {
            keyHolders(where: { address: $address }) {
                keys {
                    expiration
                    keyId
                    lock {
                        address
                    }
                }
            }
        }
    `
    const variables = {
        address: _holder,
    }

    return graphQLClients[_chain].request(query, variables)
}

const verifyActiveLock = (data: { lock: string; address: string; chain: number }) => {
    verifyHolder(data.lock, data.address, data.chain).then((result) => {
        const response: verifyHolderResponse = result
        const keys = response.keyHolders[0].keys
        keys.forEach((key) => {
            if (key.lock.address === data.lock) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000)
                const diff = key.expiration - currentTimeInSeconds
                return diff > 0
            } else {
                return false
            }
        })
        return false
    })
}

export const verifyPurchase = async (_userAddress: string, _lockAddress: string, _lockChain: number) => {
    const query = gql`
        query locks($address: String!) {
            locks(where: { address: $address }) {
                owner
                keys {
                    owner {
                        id
                    }
                }
            }
        }
    `
    interface Lock {
        owner: string
        keys: Array<{ owner: { id: string } }>
    }
    const variables = {
        address: _lockAddress,
    }
    const { locks } = await graphQLClients[_lockChain].request<{ locks: Lock[] }>(query, variables)
    if (isSameAddress(locks[0].owner, _userAddress)) return true
    return locks[0]?.keys?.some((key) => isSameAddress(key.owner.id, _userAddress))
}

export const getLocks = async <UnlockLocks>(_address1: string) => {
    const query = gql`
        query lockManager($address: String!) {
            lockManagers(where: { address: $address }) {
                lock {
                    name
                    price
                    address
                }
            }
        }
    `
    const variables = {
        address: _address1,
    }

    const dataRes: Array<{ lock: { chain: number; name: string; price?: string; address: string } }> = []

    for (const key of Object.keys(graphEndpointKeyVal)) {
        const data = await graphQLClients[key].request(query, variables)
        data.lockManagers.forEach(
            (element: { lock: { chain: number; name: string; price?: string; address: string } }) => {
                element.lock.chain = Number.parseInt(key, 10)
                dataRes.push(element)
            },
        )
    }
    return dataRes
}

export const getPurchasedLocks = async (_address: string) => {
    const query = gql`
        query keyPurchases($address: String!) {
            keyPurchases(orderBy: timestamp, orderDirection: desc, where: { purchaser: $address }) {
                lock
                purchaser
            }
        }
    `

    const variables = {
        address: _address,
    }
    const dataRes: Array<{ lock: string; chain: number }> = []

    for (const key of Object.keys(graphEndpointKeyVal)) {
        const data = await graphQLClients[key].request(query, variables)
        data.keyPurchases.forEach((element: { lock: string; chain: number }) => {
            element.chain = Number.parseInt(key, 10)
            dataRes.push(element)
        })
    }
    return dataRes
}

export const postUnlockData = async (myBody: string | object) => {
    const response = await fetch(urlcat(keyServerEndpoint, 'add'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: stringify(myBody), // string or object
    })
    return response.status
}
export const getKey = async <requestKeyResponse>(data: unknown) => {
    const response = await fetch(urlcat(keyServerEndpoint, 'request'), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: stringify(data),
    })
    return response.json()
}

export * from './utils/crypto'
