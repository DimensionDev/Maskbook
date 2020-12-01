import type { EthereumNetwork, EthereumTokenType } from '../../web3/types'
import type { ERC20TokenRecord } from '../Wallet/database/types'

export interface ITO_JSONPayload {
    contract_version: number
    contract_address: string
    rpid: string
    password: string
    shares: number
    sender: {
        address: string
        name: string
        message: string
    }
    is_random: boolean
    total: string
    creation_time: number
    duration: number
    network?: EthereumNetwork
    token_type: EthereumTokenType.Ether | EthereumTokenType.ERC20
    token?: Pick<ERC20TokenRecord, 'address' | 'name' | 'decimals' | 'symbol'>
}
