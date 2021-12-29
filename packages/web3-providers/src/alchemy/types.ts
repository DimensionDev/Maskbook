export interface AlchemyNFTItemResponse {
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
        metadata: [
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
            {
                name: string
                value: string
            },
        ]
    }
}
