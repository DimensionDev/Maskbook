export interface GoPlusSpender {
    approved_contract: string
    approved_amount: string
    address_info: {
        contract_name: string
        is_contract: -1 | 1
        is_open_source: -1 | 1
        tag: string
    }
}

export interface GoPlusTokenInfo {
    token_address: string
    token_name: string
    token_symbol: string
    chain_id: string
    balanace: string
    approved_list: GoPlusSpender[]
}

export interface GoPlusTokenSpender {
    name: string
    address: string
    amount: number
    logo?: JSX.Element
    isMaskDapp: boolean
    tokenInfo: {
        address: string
        symbol: string
        name: string
    }
}
