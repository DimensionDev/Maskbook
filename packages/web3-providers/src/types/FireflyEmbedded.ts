/**
 * Types for the Firefly embedded wallet (the backend that formerly powered the
 * Privy embedded wallet). All requests target `api.firefly.land` and are
 * authenticated with the Firefly access token.
 */

/** Universal Firefly API response envelope. */
export interface FireflyResponse<T> {
    code: number
    data?: T
    error?: string[] | string
    message?: string
}

export type SignEncoding = 'utf-8' | 'hex'

/** EVM transaction payload handed to the Firefly signing backend. */
export interface EvmTransaction {
    from: string
    to: string
    chain_id: string
    nonce?: number
    data?: string
    value?: string
    type?: 0 | 1 | 2 | 4
    gas_limit?: string
    gasPrice?: string
    max_fee_per_gas?: string
    max_priority_fee_per_gas?: string
}

/** A linked embedded account returned by `GET /v1/privy-api/user`. */
export interface EmbeddedLinkedAccount {
    address: string
    chain_id: string
    chain_type: 'solana' | 'ethereum'
    connector_type: string
    delegated: boolean
    first_verified_at: number
    latest_verified_at: number
    verified_at: number
    id: string | null
    imported: boolean
    public_key: string | null
    recovery_method: string
    type: string
    wallet_client: string
    wallet_client_type: string
    wallet_index: number
}

export interface EmbeddedUser {
    id: string
    created_at: number
    has_accepted_terms: boolean
    linked_accounts: EmbeddedLinkedAccount[]
}

/** Wallet account returned by `POST /v1/user/create/privy/user`. */
export interface CreatedEmbeddedWalletAccount {
    publicAddress: string
    chain: string
    verified_at: number
}

export interface CreatedEmbeddedUser {
    accountId: string
    userId: string
    createAt: number
    wallets: CreatedEmbeddedWalletAccount[]
}

export interface PersonalSignResult {
    signature: string
    encoding: SignEncoding
}

export interface SignTypedDataResult {
    signature: string
    encoding: string
}

export interface SignTransactionResult {
    signedTransaction: string
    encoding: string
}

export interface SendTransactionResult {
    hash: string
    caip2: string
    transaction_id: string
}

/**
 * Minimal EIP-1193 request surface implemented by {@link FireflyEmbeddedProvider}.
 * Only signing/account methods are routed to the backend; read RPC is handled by
 * the existing Mask readonly providers.
 */
export interface EIP1193RequestProvider {
    // EIP-1193 `request` is loosely typed (like ethers/extension providers); callers
    // cast the result to the expected shape for the RPC method.
    request(args: { method: string; params?: unknown[] | object }): Promise<any>
    on?(event: string, handler: (...args: unknown[]) => void): void
    off?(event: string, handler: (...args: unknown[]) => void): void
    removeListener?(event: string, handler: (...args: unknown[]) => void): void
}
