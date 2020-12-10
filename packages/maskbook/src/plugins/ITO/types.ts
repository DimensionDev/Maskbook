import type { ERC20TokenDetailed, EthereumNetwork, EthereumTokenType, EtherTokenDetailed } from '../../web3/types'

export interface ITO_JSONPayload {
    contract_address: string
    pid: string // pool id
    password: string
    limit: string
    total: string
    sender: {
        address: string
        name: string
        message: string
    }
    start_time: number
    end_time: number
    creation_time: number
    network: EthereumNetwork
    token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    token?: EtherTokenDetailed | ERC20TokenDetailed
    exchange_amonuts: string[]
    exchange_tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]
}
