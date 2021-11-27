export interface Investable {
    angels: Angel[]
    apy: string
    category: InvestableType
    chainId: number
    claims: Token[]
    createdAt: string
    id: number
    liquidity: number
    name: string
    protocol: string
    stakingToken: Token | null
    strategies: Strategy[]
    swapProtocol: string | null
    address: string
    token: Token
    tokens: Token[]
    updatedAt: string
}

export interface Angel {
    address: string
    rewardToken: Token
}

export interface Token {
    address: string
    decimals: number
    name: string
    symbol: string
}

export interface Strategy {
    locale: string
    description: string
}

export enum InvestableType {
    farm = 'farm',
    pool = 'pool',
}
