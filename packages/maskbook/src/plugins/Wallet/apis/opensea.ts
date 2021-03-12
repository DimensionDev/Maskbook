interface Account {
    address: string
}

interface Contract {
    account: Account
    name: string
    symbol: string
}

interface Collection {
    imageUrl: string
    id: string
    name: string
    slug: string
    hidden: boolean
    description: string
}

export interface Asset {
    assetContract: Contract
    tokenId: string
    imageUrl: string
    collection: Collection
    name: string
    id: string
    description: string
}

export interface AssetsListResponse {
    data: {
        search: {
            edges: {
                node: {
                    asset: Asset
                }
            }[]
        }
    }
}

export async function getAssetsList(from: string) {
    const response = await fetch('https://api.opensea.io/graphql/', {
        method: 'POST',
        mode: 'cors',
        body: JSON.stringify({
            query: `
            {
                search (identity: { address: "${from.toLowerCase()}" }, first: 100) {
                    edges {
                        node {
                            asset {
                                assetContract {
                                    account {
                                        address
                                    }
                                    name
                                    symbol
                                }
                                tokenId
                                imageUrl
                                collection {
                                    imageUrl
                                    id
                                    name
                                    slug
                                    hidden
                                    description
                                }
                                name
                                id
                                description
                            }
                        }
                    }
                }
            }
            `,
            variables: null,
        }),
    })
    return (await response.json()) as AssetsListResponse
}
