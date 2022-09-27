export namespace EVM {
    export interface AttributesValue {
        attributes_value: string
        total: number
    }
    export interface Attributes {
        attributes_name: string
        attributes_values: AttributesValue[]
        total: number
    }

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

    export interface Collection {
        contract_address: string
        name: string
        symbol: string
        description: string
        website: string | null
        email: string | null
        twitter: string | null
        discord: string | null
        telegram: string | null
        github: string | null
        instagram: string | null
        medium: string | null
        logo_url: string
        banner_url: string
        featured_url: string
        large_image_url: string
        attributes: Attributes[]
        erc_type: ErcType | string
        deploy_block_number: number
        owner: string
        verified: boolean
        items_total: number
        owners_total: number
        opensea_floor_price: number
        floor_price: number
        price_symbol: string
        collections_with_same_name: []
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
        latest_trade_timestamp: number | null
        nftscan_id: string | null
        nftscan_uri: string | null
    }

    export enum ErcType {
        ERC721 = 'erc721',
        ERC1155 = 'erc1155',
    }

    export interface AssetsGroup {
        contract_address: string
        contract_name: string
        logo_url: string | null
        owns_total: number
        items_total: number
        description: string
        assets: Asset[]
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

    export interface NFTPlatformInfo {
        description: string
        royalty: string
        trendingVolumeAverage_24h: number
        twitter: string
        total: number
        trendingVolume_all: number
        email: string
        trendingVolume_24h: number
        floorPrice: number
        /** url */
        image: string
        highestPrice: number
        /** url */
        website: string
        /** url */
        github: string
        address: string
        /** url */
        banner: string
        authFlag: false
        /** url */
        discord?: string
        instagram?: string
        medium?: string
        facebook?: string
        reddit?: string
        telegram?: string
        youtube?: string
        trendingTotal_24h: number
        name: string
        contractCreator: string
        ownersCount: number
    }

    export interface SearchNFTPlatformNameResult {
        /** url */
        image: string
        address: string
        platform: string
    }

    export interface VolumeAndFloorRecord {
        /** timestamp */
        time: number
        price: number
        volume: number
        sales: number
    }
    export interface VolumeAndFloor {
        code: number
        result: VolumeAndFloorRecord[]
        sales: number
        volume: number
    }
}
