import type { ChainId, ERC20Token, ERC721Token, EtherToken } from '../../web3/types'

export interface MarketplaceTrader {
    address: string
    name: string
}
export interface MarketplaceJSONPayloadInMask {
    contract_address: number
    chain_id: ChainId
    start_time: number
    end_time: number
    creation_time: number
    seller: MarketplaceTrader
    buyers: MarketplaceTrader[]
    /**
     * Tokens to be sold
     */
    tokenIds: string[]
    /**
     * The token contract of sold tokens.
     */
    token: ERC721Token
    /**
     * The available token contracts of exchange tokens.
     */
    exchange_tokens: (EtherToken | ERC20Token)[]
}

type TokenOutMask = Omit<MarketplaceJSONPayloadInMask['token'], 'chainId'> & {
    chain_id: ChainId
}

export interface MarketplaceJSONPayloadOutMask extends Omit<MarketplaceJSONPayloadInMask, 'token' | 'exchange_tokens'> {
    token: TokenOutMask
    exchange_tokens: TokenOutMask[]
}
