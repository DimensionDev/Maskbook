import { type BigNumber } from 'bignumber.js'
export interface Asset {
    chain: string // ethereum
    collection: {
        banner_image_url: string
        collection_id: number
        description: string
        discord_url: string
        floor_prices: Array<{
            marketplace_id: string // opensea
            marketplace_name: string // Opensea
            payment_token: PaymentToken
        }>
        image_url: string
        marketplace_pages: Array<{
            collection_url: string
            nft_url: string
            marketplace_collection_id: string
            marketplace_id: string
            marketplace_name: string
            verified: boolean
        }>
        distinct_nfts_owned: number
        total_copies_owned: number
        distinct_owner_count: number
        distinct_nft_count: number
        name: string
        top_contracts: string[] // ["ethereum.0x18487d2cac946c7fe800855c4039aac210f68baa"]
        total_quantity: number
        twitter_username: string // twitter handler
    }
    contract: {
        deployed_by: string // EOA
        deployed_via_contract: string | null
        name: string
        symbol: string
        type: string // ERC721
    }
    contract_address: string
    description: string
    image_url: string
    name: string
    created_date: string // "2022-04-04T20:15:02"
    token_id: string
    token_count: number
    nft_id: string // ethereum.0x18487d2cac946c7fe800855c4039aac210f68baa.1597
    last_sale?: {
        from_address: string
        to_address: string
        marketplace_id: string
        total_price: BigNumber.Value
        unit_price: BigNumber.Value
        transaction: string // tx hash
        marketplace_name: string
        payment_token?: PaymentToken
        timestamp: string // "2022-04-04T20:15:02"
    }
    owners: Array<{
        owner_address: string
    }>
    previews: {
        image_large_url?: string
    }
}

// Todo: contract address will be added in SimpleHash v1 release.
// Todo: Asking SimpleHash to add schema in SimpleHash v1 release.
export interface Collection {
    // Todo: the collection id key name may change in SimpleHash v1 release.
    id: string
    name: string
    image_url: string
    chain: string
    distinct_nfts_owned: number // owner balance
    total_copies_owned: number
    distinct_owner_count: number
    distinct_nft_count: number
    total_quantity: number
    floor_prices: Array<{
        marketplace_id: string // opensea
        marketplace_name: string // Opensea
        payment_token: PaymentToken
    }>
    top_contracts: string[] // ["ethereum.0x18487d2cac946c7fe800855c4039aac210f68baa"]
}

interface PaymentToken {
    address: string | null
    decimals: number
    name: string
    payment_token_id: string // ethereum.native
    symbol: string
    value: BigNumber.Value
}
