import { Pagination, Web3Plugin, CurrencyType } from '@masknet/plugin-infra'
import { ChainId, getTokenConstants } from '@masknet/web3-shared-solana'
import { CoinGecko } from '@masknet/web3-providers'
import { createFungibleAsset, createFungibleToken } from '../helpers'
import { NETWORK_ENDPOINTS } from '../constants'

interface RpcOptions {
    method: string
    params?: any[]
}

interface RpcResponse<T> {
    jsonrpc: '2.0'
    result: T | null
}

interface AccountInfo {
    data: [string, string] | object
    executable: boolean
    lamports: number
}

type GetAccountInfoResponse = RpcResponse<{ value: AccountInfo }>
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
}

type GetProgramAccountsResponse = RpcResponse<Array<ProgramAccount>>

let id = 0
async function requestRPC<T = unknown>(chainId: ChainId, options: RpcOptions): Promise<T> {
    const endpoint = NETWORK_ENDPOINTS[chainId]
    id += 1
    const res = await globalThis.fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            ...options,
            jsonrpc: '2.0',
            id,
        }),
    })
    return res.json()
}

async function getSolanaBalance(chainId: ChainId, account: string) {
    const { TETHER_ADDRESS = '' } = getTokenConstants(chainId)
    const price = await CoinGecko.getTokenPrice('solana', CurrencyType.USD)
    const data = await requestRPC<GetAccountInfoResponse>(chainId, {
        method: 'getAccountInfo',
        params: [account],
    })
    const balance = data.result?.value.lamports.toString() ?? '0'
    return createFungibleAsset(
        createFungibleToken(chainId, TETHER_ADDRESS, 'Solana', 'SOL', 9),
        balance,
        new URL('../assets/solana.png', import.meta.url).toString(),
        price,
    )
}

const SPL_TOKEN_PROGRAM_ID = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'

async function getFungibleTokenLists(chainId: ChainId, account: string) {
    const data = await requestRPC<GetProgramAccountsResponse>(chainId, {
        method: 'getProgramAccounts',
        params: [
            SPL_TOKEN_PROGRAM_ID,
            {
                encoding: 'jsonParsed',
                filters: [
                    {
                        dataSize: 165,
                    },
                    {
                        memcmp: {
                            offset: 32,
                            bytes: account,
                        },
                    },
                ],
            },
        ],
    })
    if (!data.result?.length) return []
    return data.result.map((programAccount) => {
        const info = programAccount.account.data.parsed.info
        return createFungibleAsset(
            createFungibleToken(chainId, info.mint, info.mint, info.mint, info.tokenAmount.decimals),
            info.tokenAmount.amount,
        )
    })
}

export async function getFungibleAssets(
    address: string,
    provider: string,
    network: Web3Plugin.NetworkDescriptor,
    pagination?: Pagination,
): Promise<Web3Plugin.Asset<Web3Plugin.FungibleToken>[]> {
    const allSettled = await Promise.allSettled([
        getSolanaBalance(network.chainId, address).then((x) => [x]),
        getFungibleTokenLists(network.chainId, address),
    ])

    return allSettled
        .map((x) => (x.status === 'fulfilled' ? x.value : null))
        .flat()
        .filter(Boolean) as Web3Plugin.Asset<Web3Plugin.FungibleToken>[]
}
