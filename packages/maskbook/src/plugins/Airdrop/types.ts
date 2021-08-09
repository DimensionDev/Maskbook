import type { ChainId, FungibleTokenDetailed } from '@masknet/web3-shared'

export interface AirdropJSONPayload {
    contract_address: string
    id: string
    message: string
    total: string
    total_remaining: string
    start_time: number
    end_time: number
    creation_time: number
    chain_id: ChainId
    token: FungibleTokenDetailed
    host: {
        address: string
        name: string
    }
    holders: {
        address: string
        name: string
    }[]
}
