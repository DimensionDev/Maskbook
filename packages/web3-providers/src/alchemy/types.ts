export interface AlchemyResponse {
    ownedNfts: AlchemyNFT[]
    pageKey?: string
}

export interface AlchemyNFT {
    contract: {
        address: string
    }
    id: {
        tokenId: number
        tokenMetadata: {
            tokenType: 'ERC721' | 'ERC1155'
        }
    }
    title: string
    description: string
    tokenUri: {
        raw: string
        gateway: string
    }
    media: [
        {
            raw: string
            gateway: string
        },
    ]
    metadata: {
        name: string
        description: string
        image: string
        external_url: string
        attributes: Array<{
            value: string
            trait_type: string
        }>
    }
    timeLastUpdated: string
}
