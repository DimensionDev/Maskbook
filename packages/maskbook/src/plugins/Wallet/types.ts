export enum TransactionType {}

export interface Transaction {
    type: TransactionType
}

export enum TransactionProvider {
    ZERION,
    DEBANK,
}

export enum AssetProvider {
    OPENSEAN,
}

export interface AssetInCard {
    asset_contract: {
        address: string
        schema_name: 'ERC721' | 'ERC1155'
        symbol: string
    }
    token_id: string
    image?: string
    name: string
    permalink: string
}
