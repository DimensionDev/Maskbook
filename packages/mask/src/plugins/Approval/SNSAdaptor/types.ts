export interface RawSpender {
    id: string
    value: number
    exposure_usd: number
    protocol: {
        id: string
        name: string
        logo_url: string
        chain: string
    } | null
    is_contract: boolean
    is_open_source: boolean
    is_hacked: boolean
    is_abandoned: boolean
}

export interface RawTokenInfo {
    id: string
    name: string
    symbol: string
    logo_url: string
    chain: string
    price: number
    balance: number
    spenders: RawSpender[]
}

export type TokenInfo = Omit<RawTokenInfo, 'spenders'>

export type Spender = Omit<RawSpender, 'protocol'> & {
    tokenInfo: TokenInfo
    name: string | undefined
    logo: string | React.ReactNode | undefined
    isMaskDapp: boolean
}

export type ResponseData = RawTokenInfo[]
