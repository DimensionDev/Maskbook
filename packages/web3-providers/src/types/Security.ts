import type { ChainId } from '@masknet/web3-shared-evm'
import type { SecurityMessage } from '../GoPlusLabs/types.js'

/**
 * "1" means true;
 * "0" means false.
 */
type BooleanChar = '0' | '1'

export namespace SecurityAPI {
    export interface Holder {
        address?: string
        locked?: BooleanChar
        tag?: string
        is_contract?: BooleanChar
        balance?: number
        percent?: number
    }

    export interface TradingSecurity {
        buy_tax?: string
        sell_tax?: string
        slippage_modifiable?: BooleanChar
        is_honeypot?: BooleanChar
        transfer_pausable?: BooleanChar
        is_blacklisted?: BooleanChar
        is_whitelisted?: BooleanChar
        is_in_dex?: BooleanChar
        is_anti_whale?: BooleanChar
        trust_list?: BooleanChar
    }

    export interface ContractSecurity {
        is_open_source?: BooleanChar
        is_proxy?: BooleanChar
        is_mintable?: BooleanChar
        owner_change_balance?: BooleanChar
        can_take_back_ownership?: BooleanChar
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

        is_true_token?: BooleanChar
        is_verifiable_team?: BooleanChar
        is_airdrop_scam?: BooleanChar
    }

    export interface AddressSecurity {
        /**
         * It describes the data source for this address information.
         * For example: GoPlus/SlowMist
         */
        data_source: LiteralUnion<'GoPlus' | 'SlowMist'>
        /** It describes whether this address is related to honeypot tokens or has created scam tokens.  */
        honeypot_related_address: BooleanChar
        /** It describes whether this address has implemented phishing activities.  */
        phishing_activities: BooleanChar
        /** It describes whether this address has implemented blackmail activities. */
        blackmail_activities: BooleanChar
        /** It describes whether this address has implemented stealing attacks. */
        stealing_attack: BooleanChar
        /** It describes whether this address is involved in fake KYC. */
        fake_kyc: BooleanChar
        /** It describes whether this address is involved in malicious mining activities. */
        malicious_mining_activities: BooleanChar
        /** It describes whether this address is involved in darkweb transactions */
        darkweb_transactions: BooleanChar
        // cspell:ignore cybercrime
        /** It describes whether this address is involved in cybercrime. */
        cybercrime: BooleanChar
        /** It describes whether this address is involved in money laundering. */
        money_laundering: BooleanChar
        /** It describes whether this address is involved in financial crime. */
        financial_crime: BooleanChar
        /** It describes whether this address is suspected of malicious behavior. */
        blacklist_doubt: BooleanChar
        /** It describes whether this address is a contract address. */
        contract_address: BooleanChar
    }

    export interface SecurityItem {
        is_high_risk?: boolean
        risk_item_quantity?: number
        warn_item_quantity?: number
        message_list?: SecurityMessage[]
    }

    export interface SupportedChain<ChainId> {
        chainId: ChainId
        name: string
    }

    export type TokenSecurityType = ContractSecurity &
        TokenSecurity &
        SecurityItem &
        TradingSecurity & {
            contract: string
            chainId: ChainId
        }
}
