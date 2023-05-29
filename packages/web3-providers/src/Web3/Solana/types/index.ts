import type { ChainId, ProviderType, Transaction } from '@masknet/web3-shared-solana'
import type { ConnectionOptions_Base } from '../../Base/apis/ConnectionOptionsAPI.js'
import type { HubOptions_Base } from '../../Base/apis/HubOptionsAPI.js'

export type ConnectionOptions = ConnectionOptions_Base<ChainId, ProviderType, Transaction>
export type HubOptions = HubOptions_Base<ChainId>

export interface RpcOptions {
    method: string
    params?: unknown[]
}

export interface RpcResponse<T> {
    jsonrpc: '2.0'
    result: T | null
}

export interface AccountInfo {
    data: [string, string] | object
    executable: boolean
    lamports: number
}

export interface ProgramAccount {
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

export type GetAccountInfoResponse = RpcResponse<{ value: AccountInfo }>

export type GetBalanceResponse = RpcResponse<{ value: number }>

export type GetProgramAccountsResponse = RpcResponse<ProgramAccount[]>

export interface SplToken {
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
