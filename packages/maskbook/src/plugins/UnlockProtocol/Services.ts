import { GraphQLClient, gql } from 'graphql-request'
import stringify from 'json-stable-stringify'
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

const verifyHolder = async <verifyHolderResponse>(_lockAddress: String, _holder: String, _chain: number) => {
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
    const data = await graphQLClients[_chain].request(query, variables)
    return data
}

export const verifyActiveLock = (data: { lock: string; address: string; chain: number }) => {
    verifyHolder(data.lock, data.address, data.chain).then((result) => {
        const response: verifyHolderResponse = result
        const keys = response.keyHolders[0].keys
        keys.forEach((key) => {
            if (key.lock.address === data.lock) {
                const currentTimeInSeconds = Math.floor(Date.now() / 1000)
                const diff = key.expiration - currentTimeInSeconds
                if (diff > 0) {
                    return true
                } else {
                    return false
                }
            } else {
                return false
            }
        })
        return false
    })
}

export const getLocks = async (_address1: String, chain: string) => {
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
    const data = await graphQLClients[chain].request(query, variables)
    return data
}

export const getPurchasedLocks = async (_address: string, _chain: number) => {
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

    const data = await graphQLClients[_chain].request(query, variables)
    return data
}

export const postUnlockData = async (myBody: any) => {
    const response = await fetch(keyServerEndpoint + '/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: stringify(myBody), // string or object
    })
    return response.status
}
export const getKey = async <requestKeyResponse>(data: any) => {
    const response = await fetch(keyServerEndpoint + '/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: stringify(data),
    })
    return response.json()
}

export * from './utils/crypto'
