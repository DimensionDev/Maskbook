import type { ChainId } from '@masknet/web3-shared-evm'

export interface FT {
    contract_address: string
    name: string
    symbol: string
    decimals: number
    balance: string
}

export interface FT_Price {
    price: number
    symbol: string
    source: string
    updated_at: string
}

export interface FT_Metadata {
    contract_address: string
    name: string
    symbol: string
    decimals: string
    total_supply: string
}

export interface NFT {
    contract_address: string
    token_id: string
    contract_type: 'ERC721' | 'ERC1155'
    contract_name: string
    contract_symbol: string
    token_uri?: string
    owner?: string
}

export interface NFT_Metadata {
    contract_address: string
    token_id: string
    name: string
    symbol: string
    decimals: number
    owner: string
    token_uri?: string
}

export interface NFT_TransferEvent {
    // e.g., 2022-01-22T04:53:39Z
    block_timestamp: string
    block_number: number
    transaction_hash: string
    transaction_index: number
    from_address: string
    to_address: string
    value: string
    token_id: string
    operator_address: string
    log_index: number
    chain_id: ChainId
}

export interface NFT_FloorPrice {
    floor_price: number
    symbol: 'eth' | Omit<string, 'eth'>
    source: 'opensea' | Omit<string, 'opensea'>
    // e.g., 2022-05-18T07:44:18Z
    updated_at: string
}

export interface Tx {
    chain_id: ChainId
    type: 0
    status: 0 | 1
    block_number: string
    // e.g., 2022-05-17T20:41:19Z
    block_timestamp: string
    transaction_hash: string
    transaction_index: number
    from_address: string
    to_address: string
    value: string
    input: string
    nonce: number
    contract_address: string
    gas: number
    gas_price: number
    gas_used: number
    effective_gas_price: number
    cumulative_gas_used: number
    max_fee_per_gas: number
    max_priority_fee_per_gas: number
}
