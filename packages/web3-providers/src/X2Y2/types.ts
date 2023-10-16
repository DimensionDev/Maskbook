export interface Order {
    maker: string
    id: number
    currency: string
    taker?: string
    price: string
    created_at: string
    item_hash: string
    type: 'sell' | 'buy'
    token: Token
    is_collection_offer: boolean
    end_at: string
}

export interface Contract {
    name: string
    royalty_fee: number
    nsfw: boolean
    verified: boolean
    erc_type: number
    slug: string
    contract: string
    suspicious: boolean
    symbol: string
}

interface Token {
    token_id: number
    contract: string
}

export interface Event {
    from_address: string
    id: number
    order: {
        maker: string
        id: number
        currency: string
        taker?: string
        price: string
        created_at: string
        item_hash: string
        type: string
        token: Token
        is_collection_offer: false
        end_at: string
    }
    tx?: string
    created_at: string
    to_address: string
    type: 'offer_listing'
    token: Token
}
