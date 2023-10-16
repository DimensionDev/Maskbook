import type { ReactNode } from 'react'

interface RawTokenSpender {
    id: string
    address: string
    amount: number
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
    address: string
    name: string
    symbol: string
    logo_url: string
    chain: string
    price: number
    balance: number
    spenders: RawTokenSpender[]
}

type TokenInfo = Omit<RawTokenInfo, 'spenders'>

export type TokenSpender = Omit<RawTokenSpender, 'protocol'> & {
    tokenInfo: TokenInfo
    name: string | undefined
    logo: ReactNode | undefined
    isMaskDapp: boolean
}

export interface NFTInfo {
    chain: string
    amount: string
    contract_name: string
    is_erc721?: boolean
    contract_id: string
    isMaskDapp?: boolean
    spender: Omit<TokenSpender, 'tokenInfo'>
}
