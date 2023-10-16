export namespace Solana {
    export interface Account {
        address: string
        share: number
    }

    export interface File {
        /** MIME type */
        type: string
        uri: string
    }

    export interface TraitAttribute {
        attribute_name: string
        attribute_value: string
        percentage: string
    }

    export interface Payload {
        background_color?: string
        attributes: TraitAttribute[]
        name?: string
        symbol?: string
        description?: string
        image?: string
        collection?: {
            name?: string
            family?: string
        }
        properties?: {
            category?: string
            creators?: Account[]
            files?: File[]
        }
        seller_fee_basis_points?: number
    }

    export interface Asset {
        block_number?: number
        collection?: string
        content_type?: string
        content_uri?: string
        external_link?: string
        image_uri?: string
        interact_program?: string
        latest_trade_price?: number
        latest_trade_timestamp?: number
        latest_trade_transaction_hash?: string
        metadata_json?: string
        mint_price?: number
        mint_timestamp?: number
        mint_transaction_hash?: string
        minter?: string
        name?: string
        owner?: string
        token_address: string
        token_uri?: string
        attributes?: TraitAttribute[]
    }

    export interface Transaction {
        block_number?: number
        collection?: string
        destination?: string
        event_type?: string
        exchange_name?: string
        fee?: number
        hash: string
        interact_program?: string
        nftscan_tx_id?: string
        source?: string
        timestamp?: number
        token_address?: string
        trade_price?: number
        next?: string
        total?: number
    }

    export interface Attribute {
        attributes_name?: string
        attributes_values?: Array<{
            attributes_value?: string
            total?: number
        }>
    }

    export interface Collection {
        attributes?: Attribute[]
        banner_url?: string
        collection?: string
        create_block_number?: number
        description?: string
        discord?: string
        email?: string
        featured_url?: string
        github?: string
        instagram?: string
        items_total?: number
        large_image_url?: string
        logo_url?: string
        medium?: string
        owners_total?: number
        symbol?: string
        telegram?: string
        twitter?: string
        verified?: boolean
        website?: string
    }
}
