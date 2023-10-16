export namespace EVM {
    export interface Attribute {
        attribute_name: string
        attribute_value: string
        percentage: string
    }

    export interface Payload {
        name?: string
        description?: string
        image?: string
        attributes?: Array<{
            trait_type: string
            value: string
            percentage?: string
        }>
    }

    export interface Asset {
        attributes: Attribute[]
        contract_address: string
        contract_name: string
        contract_token_id: string
        token_id: string
        erc_type: ErcType | string
        owner: string
        mint_transaction_hash: string
        mint_timestamp: number
        mint_price: number
        token_uri?: string
        minter: string
        metadata_json?: string
        name: string
        /** mime type */
        content_type: string
        content_uri: string
        image_uri?: string
        external_uri: string
        latest_trade_price: string | null
        latest_trade_symbol: string | null
        latest_trade_timestamp: number | null
        nftscan_id: string | null
        imageURL: string | null
    }

    export enum ErcType {
        ERC721 = 'erc721',
        ERC1155 = 'erc1155',
    }

    export interface AssetsGroup {
        contract_address: string
        contract_name: string | null
        verified?: boolean
        opensea_verified?: boolean
        logo_url?: string | null
        owns_total: number
        items_total: number
        description: string | null
        assets: Asset[]
        symbol: string | null
    }

    export interface Transaction {
        amount: string
        block_hash: string
        block_number: number
        contract_address: string
        contract_name: string
        contract_token_id: string
        erc_type: string
        event_type: string
        exchange_name: string
        from: string
        gas_fee: number
        gas_price: string
        gas_used: string
        hash: string
        nftscan_tx_id: string
        receive: string
        send: string
        timestamp: number
        to: string
        token_id: string
        trade_price: number
        trade_symbol: string
        trade_value: string
    }

    export type CollectionTrendingRange = '1h' | '4h' | '12h' | '1d' | '3d' | '7d' | '30d' | '90d' | '1y' | 'all'
    export interface CollectionTrendingRecord {
        begin_timestamp: number
        end_timestamp: number
        average_price: number
        volume: number
    }
}
