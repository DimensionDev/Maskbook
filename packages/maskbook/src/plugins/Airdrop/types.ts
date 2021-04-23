import type { ChainId, ERC20TokenDetailed, NativeTokenDetailed } from '../../web3/types'

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
    token: NativeTokenDetailed | ERC20TokenDetailed
    host: {
        address: string
        name: string
    }
    holders: {
        address: string
        name: string
    }[]
}
