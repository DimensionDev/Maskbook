export const GO_PLUS_LABS_ROOT_URL = 'https://gopluslabs.r2d2.to'

export enum SecurityMessageLevel {
    High = 'High',
    Medium = 'Medium',
    Safe = 'Safe',
}

export type SecurityKey =
    | 'security_info_code_not_verify_title'
    | 'security_info_code_not_verify_message'
    | 'security_info_functions_that_can_suspend_trading_title'
    | 'security_info_functions_that_can_suspend_trading_message'
    | 'default_placeholder'
    | 'not_found_tip_title'
    | 'not_found_tip_network_error'
    | 'not_found_tip_network_chain_correct'
    | 'not_found_tip_network_address_not_cover'
    | 'risk_safe_description'
    | 'risk_contract_source_code_verified_title'
    | 'risk_contract_source_code_verified_body'
    | 'risk_contract_source_code_not_verified_title'
    | 'risk_contract_source_code_not_verified_body'
    | 'risk_proxy_contract_title'
    | 'risk_proxy_contract_body'
    | 'risk_no_proxy_title'
    | 'risk_no_proxy_body'
    | 'risk_mint_function_title'
    | 'risk_mint_function_body'
    | 'risk_no_mint_function_title'
    | 'risk_no_mint_function_body'
    | 'risk_can_take_back_ownership_title'
    | 'risk_can_take_back_ownership_body'
    | 'risk_no_can_take_back_ownership_title'
    | 'risk_no_can_take_back_ownership_body'
    | 'risk_owner_change_balance_title'
    | 'risk_owner_change_balance_body'
    | 'risk_owner_can_not_change_balance_title'
    | 'risk_owner_can_not_change_balance_body'
    | 'risk_buy_tax_title'
    | 'risk_buy_tax_body'
    | 'risk_sell_tax_title'
    | 'risk_sell_tax_body'
    | 'risk_is_honeypot_title'
    | 'risk_is_honeypot_body'
    | 'risk_is_not_honeypot_title'
    | 'risk_is_not_honeypot_body'
    | 'risk_transfer_pausable_title'
    | 'risk_transfer_pausable_body'
    | 'risk_no_code_transfer_pausable_title'
    | 'risk_no_code_transfer_pausable_body'
    | 'risk_is_anti_whale_title'
    | 'risk_is_anti_whale_body'
    | 'risk_is_no_anti_whale_title'
    | 'risk_is_no_anti_whale_body'
    | 'risk_slippage_modifiable_title'
    | 'risk_slippage_modifiable_body'
    | 'risk_not_slippage_modifiable_title'
    | 'risk_not_slippage_modifiable_body'
    | 'risk_is_blacklisted_title'
    | 'risk_is_blacklisted_body'
    | 'risk_not_is_blacklisted_title'
    | 'risk_not_is_blacklisted_body'
    | 'risk_is_whitelisted_title'
    | 'risk_is_whitelisted_body'
    | 'risk_not_is_whitelisted_title'
    | 'risk_not_is_whitelisted_body'
    | 'risk_is_true_token_title'
    | 'risk_is_true_token_body'
    | 'risk_not_is_true_token_title'
    | 'risk_not_is_true_token_body'
    | 'risk_is_airdrop_scam_title'
    | 'risk_is_airdrop_scam_body'
    | 'risk_not_is_airdrop_scam_title'
    | 'risk_not_is_airdrop_scam_body'
    | 'contract_not_found'
