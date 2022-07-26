export namespace SecurityAPI {
    export interface Holder {
        address?: string
        locked?: '0' | '1'
        tag?: string
        is_contract?: '0' | '1'
        balance?: number
        percent?: number
    }

    export interface TradingSecurity {
        buy_tax?: string
        sell_tax?: string
        slippage_modifiable?: '0' | '1'
        is_honeypot?: '0' | '1'
        transfer_pausable?: '0' | '1'
        is_blacklisted?: '0' | '1'
        is_whitelisted?: '0' | '1'
        is_in_dex?: '0' | '1'
        is_anti_whale?: '0' | '1'
        trust_list?: '0' | '1'
    }

    export interface ContractSecurity {
        is_open_source?: '0' | '1'
        is_proxy?: '0' | '1'
        is_mintable?: '0' | '1'
        owner_change_balance?: '0' | '1'
        can_take_back_ownership?: '0' | '1'
        owner_address?: string
        creator_address?: string
    }

    export interface TokenSecurity {
        token_name?: string
        token_symbol?: string

        holder_count?: number
        total_supply?: number
        holders?: Holder[]

        lp_holder_count?: number
        lp_total_supply?: number
        lp_holders?: Holder[]

        is_true_token?: '0' | '1'
        is_verifiable_team?: '0' | '1'
        is_airdrop_scam?: '0' | '1'
    }

    export interface SupportedChain<ChainId> {
        chainId: ChainId
        name: string
    }

    export interface Provider<ChainId> {
        getTokenSecurity(
            chainId: ChainId,
            listOfAddress: string[],
        ): Promise<Record<string, ContractSecurity & TokenSecurity & TradingSecurity> | void>
        getSupportedChain(): Promise<Array<SupportedChain<ChainId>>>
    }
}
