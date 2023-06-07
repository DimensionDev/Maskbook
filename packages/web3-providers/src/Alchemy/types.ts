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
        image_url: string
        external_url: string
        animation_url: string
        attributes: Array<{
            value: string
            trait_type: string
        }>
    }
    timeLastUpdated: string
}

export interface AlchemyResponse_Flow {
    ownerAddress: string
    nfts: AlchemyNFT_Flow[]
}

export interface AlchemyNFT_Flow {
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
    externalDomainViewUrl: string
    media: Array<{
        uri: string
        mimeType: string
    }>
    metadata: {
        metadata: Array<{
            name: string
            value: string
        }>
    }
}

export interface AlchemyResponse_EVM_Metadata {
    contract: {
        address: string
    }
    id: {
        tokenId: string
        tokenMetadata: {
            tokenType: 'ERC721' | 'ERC1155' | 'NOT_A_CONTRACT'
        }
    }
    title: string
    description: string
    tokenUri: {
        raw: string
        gateway: string
    }
    media: Array<{
        raw: string
        gateway: string
    }>
    metadata: {
        image: string
        external_url: string
        background_color: string
        coven: {
            skills: string
            name: string
            description: string
            styles: string[]
            id: string
            type: string
            hash: string
            birthChart: string
        }
        name: string
        description: string
        traits: Array<{
            value: string
            trait_type: string
        }>
    }
    timeLastUpdated: string
    /**
     * e.g. "Contract does not have any code"
     * and id.tokenMetadata.tokenType will be NOT_A_CONTRACT
     */
    error?: string
}

export interface AlchemyResponse_EVM_Contact_Metadata {
    address: string
    contractMetadata: {
        name: string
        symbol: string
        totalSupply: string
    }
}

export interface AlchemyResponse_EVM_Owners {
    owners: string[]
}

export interface AlchemyResponse_Flow_Metadata {
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
    externalDomainViewUrl: string
    media: Array<{
        uri: string
        mimeType: string
    }>
    metadata: {
        metadata: Array<{
            name: string
            value: string
        }>
    }
}
