export interface AlchemyNFTItemDetailedResponse {
    contract: {
        name: string
        address: string
    }
    id: {
        tokenId: string
    }
    title: string
    description: string
    media: {
        uri: string
    }
    tokenUri?: string
}

export interface AlchemyNFTItemMetadataResponse {
    contract: {
        name: string
        address: string
    }
    id: {
        tokenId: string
    }
    title: string
    description: string
    externalDomainViewUrl: string
    media: {
        uri:
            | string
            | {
                  raw: string
                  gateway: string
              }
    }[]
    tokenUri: {
        raw: string
        gateway: string
    }
    alternateMedia: { uri: string }[]
    metadata: {
        name: string
        image: string
        attributes: { trait_type: string; value: string }[]
    }
    timeLastUpdated: string
}

export interface AlchemyNFTItemResponse {
    contract: {
        address: string
    }
    id: {
        tokenId: string
    }
    title: string
    description: string
    tokenUri: {
        raw: string
        gateway: string
    }
    media: {
        raw: string
        gateway: string
    }[]
    metadata: {
        animation_url: string
        name: string
    }
}
