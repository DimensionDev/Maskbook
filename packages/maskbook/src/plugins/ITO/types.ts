import type { EthereumNetwork, EthereumTokenType } from '../../web3/types'
import type { ERC20TokenRecord } from '../Wallet/database/types'

export interface ITO_JSONPayload {
    pid: string // pool id
    password: string
    total: string
    sender: {
        address: string
        name: string
        message: string
    }
    creation_time: number
    duration: number
    network: EthereumNetwork
    token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
    exchange_ratios: string[]
    exchange_tokens: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>[]
}
