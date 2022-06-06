export interface AlchemyResponse_EVM {
    ownedNfts: AlchemyNFT_EVM[]
    pageKey?: string
}

export interface AlchemyNFT_EVM {
    contract: {
        address: string
    }
    id: {
        tokenId: string
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

export interface AlchemyResponse_FLOW {
    ownerAddress: string
    nfts: AlchemyNFT_FLOW[]
}

export interface AlchemyNFT_FLOW {
    contract: {
        name: string
        address: string
        externalDomain: string
        contractMetadata: {
            storagePath: string
            publicPath: string
            publicCollectionName: string
        }
    }
    id: {
        tokenId: string
        tokenMetadata: {
            uuid: string
        }
    }
    title: string
    description: string
    media: {
        uri: string
        mimeType: string
    }
    metadata: {
        metadata: Array<{
            name: string
            value: string
        }>
    }
}
