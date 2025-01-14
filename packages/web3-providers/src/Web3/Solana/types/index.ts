import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-solana'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptions.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptions.js'

export type SolanaConnectionOptions = BaseConnectionOptions<ChainId, ProviderType, Transaction>
export type SolanaHubOptions = BaseHubOptions<ChainId>

export interface RpcOptions {
    method: string
    params?: unknown[]
}

interface RpcResponse<T> {
    jsonrpc: '2.0'
    result: T | null
}

interface ProgramAccount {
    account: {
        data: {
            parsed: {
                info: {
                    isNative: false
                    mint: string
                    owner: string
                    state: string
                    tokenAmount: {
                        amount: string
                        decimals: number
                        uiAmount: number
                        uiAmountString: string
                    }
                }
            }
            program: 'spl-token'
            space: number
        }
        executable: boolean
        lamports: number
        owner: string
        rentEpoch: string
    }
    pubkey: string
}

export type GetBalanceResponse = RpcResponse<{ value: number }>

export type GetProgramAccountsResponse = RpcResponse<ProgramAccount[]>

export interface MaskToken {
    address: string
    name: string
    symbol: string
    logoURI: string
    originLogoURI: string
    decimals: number
    chainId?: number
}

interface RaydiumToken {
    address: string
    chainId: number
    decimals: number
    logoURI: string
    name: string
    programId: string
    symbol: string
}

export interface JupToken {
    address: string
    created_at: string
    daily_volume: number
    decimals: number
    logoURI: string
    name: string
    symbol: string
}

export interface RaydiumTokenList {
    data: {
        mintList: RaydiumToken[]
    }
    id: string
    success: boolean
}
