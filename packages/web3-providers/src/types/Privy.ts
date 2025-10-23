interface BaseAccount {
    /** unix timestamp in seconds */
    first_verified_at: number
    /** unix timestamp in seconds */
    last_verified_at: number
    /** unix timestamp in seconds */
    verified_at: number
}

interface CustomAuthAccount extends BaseAccount {
    custom_user_id: string
    type: 'custom_auth'
}

export interface WalletAccount extends BaseAccount {
    type: 'wallet'
    address: string
    /** caip-2 https://github.com/ChainAgnostic/CAIPs/blob/main/CAIPs/caip-2.md */
    chain_id: string
    chain_type: 'ethereum' | 'solana'
    connector_type: 'embedded' | string
    delegated: boolean
    imported: boolean
    recover_method: 'privy' | string
    wallet_client: 'privy' | string
    wallet_client_type: 'privy' | string
    wallet_index: number
}

export interface PrivySession {
    identity_token: string
    privy_access_token: string
    refresh_token: string
    session_update_action: 'create' | 'set' | 'update' | string
    user: {
        /** unix timestamp in seconds */
        created_at: number
        has_accept_terms: boolean
        id: string
        is_guest: boolean
        linked_accounts: Array<CustomAuthAccount | WalletAccount>
    }
}
