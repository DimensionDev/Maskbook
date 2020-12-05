import type { EthereumNetwork } from '../../web3/types'

export interface COTM_Token {
    tokenId: string // sha3(hollandchina + id)
    tokenImageURL: string
}

export interface COTM_JSONPayload {
    sender: {
        address: string
        name: string
        message: string
    }
    ntf_token: {
        address: string
        name: string
        symbol: string
    }
    creation_time: number
    network: EthereumNetwork
}
