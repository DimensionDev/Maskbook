import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-solana'
import type { BaseConnectionOptions } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { BaseHubOptions } from '../../Base/apis/HubOptionsAPI.js'

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

interface SplToken {
    symbol: string
    name: string
    mint: string
    decimals: 3
    icon: string
}

export interface RaydiumTokenList {
    name: string
    timestamp: string
    version: {
        major: number
        minor: number
        patch: number
    }
    official: SplToken[]
    unOfficial: SplToken[]
}

export interface MaskToken {
    address: string
    name: string
    symbol: string
    logoURI: string
    originLogoURI: string
    decimals: number
}
