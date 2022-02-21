export interface RpcOptions {
    method: string
    params?: unknown[]
}

export interface RpcResponse<T> {
    jsonrpc: '2.0'
    result: T | null
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

export interface AccountInfo {
    value: {
        data: {
            program: 'spl-token'
            parsed: {
                info: {
                    decimals: 6
                    authority: string
                    freezeAuthority: string
                    isInitialized?: boolean
                    mintAuthority: string
                    supply: string
                }
                type: 'mint'
            }
            lamports: number
            owner: string
            executable: boolean
            rentEpoch: number
        }
    }
}

export type GetAccountInfoResponse = RpcResponse<AccountInfo>

export type GetProgramAccountsResponse = RpcResponse<Array<ProgramAccount>>
