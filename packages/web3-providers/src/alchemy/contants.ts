export const AlchemyNetworkMap: {
    [key: string]: { baseURL: string; API_KEY: string; chainId: number }
} = {
    Ethereum: {
        baseURL: 'https://eth-mainnet.alchemyapi.io/v2/',
        API_KEY: '3TJz6QYDHCj0ZhCdGvc5IC6EtMMMTKG1',
        chainId: 1,
    },
    Polygon: {
        baseURL: 'https://polygon-mainnet.g.alchemy.com/v2/',
        API_KEY: 'PsJ3gMn6JrSE9FCzShjsjD91irkybmh_',
        chainId: 137,
    },
}
