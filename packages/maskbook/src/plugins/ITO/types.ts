import type { ChainId, ERC20TokenDetailed, EtherTokenDetailed } from '../../web3/types'

export interface ITO_JSONPayload {
    contract_address: string
    pid: string // pool id
    password: string
    limit: string
    total: string
    total_remaining: string
    claim_remaining: string
    sender: {
        address: string
        name: string
        message: string
    }
    chainId: ChainId
    start_time: number
    end_time: number
    creation_time: number
    token: EtherTokenDetailed | ERC20TokenDetailed
    exchange_amounts: string[]
    exchange_tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
}
