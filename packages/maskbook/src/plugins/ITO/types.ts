import type { ChainId, EthereumTokenType } from '../../web3/types'

export interface ITO_Token {
    chain_id: ChainId
    type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    address: string
    name?: string
    symbol?: string
    decimals: number
}

export interface ITO_JSONPayload {
    contract_address: string
    pid: string // pool id
    password: string
    limit: string
    total: string
    total_remaining: string
    sender: {
        address: string
        name: string
        message: string
    }
    chain_id: ChainId
    start_time: number
    end_time: number
    creation_time: number
    token: ITO_Token
    exchange_amounts: string[]
    exchange_tokens: ITO_Token[]
}

export enum ITO_Status {
    completed = 'completed',
    waited = 'waited',
    started = 'started',
    expired = 'expired',
}
