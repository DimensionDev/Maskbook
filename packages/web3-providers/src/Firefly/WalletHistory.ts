import { createIndicator, createNextIndicator, createPageable, type Pageable } from '@masknet/shared-base'
import { fetchJSON } from '@masknet/web3-providers/helpers'
import {
    isGte,
    isSameAddress,
    toFixed,
    TokenType,
    type Transaction,
    type TransactionAsset,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { ChainId, isValidChainId, SchemaType } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import urlcat from 'urlcat'
import type { BaseHubOptions } from '../entry-types.js'
import { FIREFLY_BASE_URL } from './constants.js'
import { resolveFireflyResponseData } from './helpers.js'

// Chains previously served by the Zerion proxy.
const SUPPORTED_CHAINS = [
    ChainId.Mainnet,
    ChainId.Optimism,
    ChainId.BSC,
    ChainId.xDai,
    ChainId.Fantom,
    ChainId.Polygon,
    ChainId.Arbitrum,
    ChainId.Avalanche,
    ChainId.Celo,
    ChainId.Base,
    ChainId.Scroll,
    ChainId.XLayer,
    ChainId.Aurora,
    ChainId.Zora,
].join(',')

// Firefly marks native currencies with this sentinel address.
const NATIVE_TOKEN_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee'
// lower than real maximum.
const MaxUint128 = toFixed('0xffffffffffffffffffffffffffffffff')

export namespace FireflyWalletHistoryAPI {
    export enum Category {
        TokenReceive = 'token_receive',
        TokenSend = 'token_send',
        TokenSwap = 'token_swap',
        TokenBridge = 'token_bridge',
        TokenApprove = 'token_approve',
        TokenRevoke = 'token_revoke',
        NftReceive = 'nft_receive',
        NftSend = 'nft_send',
        NftMint = 'nft_mint',
        ContractInteraction = 'contract_interaction',
    }

    export interface Token {
        address: string
        logo: string | null
        symbol: string
        name: string
        decimal: number
        price: string
    }

    export interface NFT {
        address: string
        token_id: string
        logo: string | null
        symbol: string
        name: string
    }

    export interface TokenTransfer {
        chain_id: number
        amount: string
        user_address: string
        recipient: string
        sender: string
        token: Token
    }

    export interface NftTransfer {
        amount: string
        user_address: string
        recipient: string
        sender: string
        nft: NFT | null
    }

    export interface Approve {
        amount: string
        spender_address: string
        token: Token
    }

    export interface WalletHistoryItem {
        chain_id: number
        hash: string
        block_number: number
        tx_status: string
        from_address: string
        to_address: string
        project_name: string
        project_logo: string
        timestamp: string
        category: Category
        nft_sends?: NftTransfer[]
        nft_receives?: NftTransfer[]
        token_sends?: TokenTransfer[]
        token_receives?: TokenTransfer[]
        token_approve?: Approve
    }

    export interface WalletHistoryResponse {
        code: number
        error?: string[]
        data?: {
            list: WalletHistoryItem[]
            cursor: string | null
        }
    }
}

const statusMap: Record<string, TransactionStatusType> = {
    success: TransactionStatusType.SUCCEED,
    fail: TransactionStatusType.FAILED,
    pending: TransactionStatusType.NOT_DEPEND,
}
const typeMap: Record<FireflyWalletHistoryAPI.Category, Transaction<ChainId, SchemaType>['type']> = {
    [FireflyWalletHistoryAPI.Category.TokenSwap]: 'trade',
    [FireflyWalletHistoryAPI.Category.TokenSend]: 'send',
    [FireflyWalletHistoryAPI.Category.TokenReceive]: 'receive',
    [FireflyWalletHistoryAPI.Category.TokenBridge]: 'send',
    [FireflyWalletHistoryAPI.Category.NftSend]: 'send',
    [FireflyWalletHistoryAPI.Category.NftReceive]: 'receive',
    [FireflyWalletHistoryAPI.Category.NftMint]: 'mint',
    [FireflyWalletHistoryAPI.Category.TokenApprove]: 'approve',
    [FireflyWalletHistoryAPI.Category.TokenRevoke]: 'approve',
    [FireflyWalletHistoryAPI.Category.ContractInteraction]: 'contract interaction',
}

function formatTokenAsset(
    transfer: FireflyWalletHistoryAPI.TokenTransfer,
    chainId: ChainId,
    direction: 'send' | 'receive',
): TransactionAsset<ChainId, SchemaType> | null {
    const token = transfer.token
    if (!token) return null
    const isNative = isSameAddress(token.address, NATIVE_TOKEN_ADDRESS)
    return {
        id: token.symbol,
        type: TokenType.Fungible,
        schema: isNative ? SchemaType.Native : SchemaType.ERC20,
        chainId,
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        direction,
        amount: transfer.amount,
        sender: transfer.sender,
        recipient: transfer.recipient,
    }
}

function formatNftAsset(
    transfer: FireflyWalletHistoryAPI.NftTransfer,
    chainId: ChainId,
    direction: 'send' | 'receive',
): TransactionAsset<ChainId, SchemaType> | null {
    const nft = transfer.nft
    if (!nft) return null
    return {
        id: `${nft.address} + ${nft.token_id}`,
        type: TokenType.NonFungible,
        schema: SchemaType.ERC721,
        chainId,
        name: nft.name,
        symbol: nft.symbol,
        address: nft.address,
        direction,
        amount: transfer.amount,
        sender: transfer.sender,
        recipient: transfer.recipient,
    }
}

function formatApproveAsset(
    item: FireflyWalletHistoryAPI.WalletHistoryItem,
    chainId: ChainId,
): TransactionAsset<ChainId, SchemaType> | null {
    const approve = item.token_approve
    const token = approve?.token
    if (!approve || !token) return null
    const isNative = isSameAddress(token.address, NATIVE_TOKEN_ADDRESS)
    return {
        id: token.symbol,
        type: TokenType.Fungible,
        schema: isNative ? SchemaType.Native : SchemaType.ERC20,
        chainId,
        name: token.name,
        symbol: token.symbol,
        address: token.address,
        direction: 'send',
        amount:
            item.category === FireflyWalletHistoryAPI.Category.TokenRevoke ? '0'
            : isGte(approve.amount, MaxUint128) ? 'unlimited'
            : approve.amount,
        sender: item.from_address,
        recipient: approve.spender_address,
    }
}

export function formatWalletHistoryTransaction(
    item: FireflyWalletHistoryAPI.WalletHistoryItem,
): Transaction<ChainId, SchemaType> | null {
    const chainId = item.chain_id
    if (!isValidChainId(chainId)) return null
    const type =
        item.category === FireflyWalletHistoryAPI.Category.TokenBridge && !item.token_sends?.length ?
            'receive'
        :   (typeMap[item.category] ?? 'contract interaction')
    const assets = compact([
        ...(item.token_receives ?? []).map((x) => formatTokenAsset(x, chainId, 'receive')),
        ...(item.token_sends ?? []).map((x) => formatTokenAsset(x, chainId, 'send')),
        ...(item.nft_receives ?? []).map((x) => formatNftAsset(x, chainId, 'receive')),
        ...(item.nft_sends ?? []).map((x) => formatNftAsset(x, chainId, 'send')),
    ])
    return {
        id: item.hash,
        hash: item.hash,
        chainId,
        type,
        from: item.from_address,
        to: item.to_address,
        timestamp: Number(item.timestamp) * 1000,
        status: statusMap[item.tx_status] ?? TransactionStatusType.NOT_DEPEND,
        assets,
        approveAssets: compact([formatApproveAsset(item, chainId)]),
    }
}

export const FireflyWalletHistory = {
    async getTransactions(
        address: string,
        { indicator }: BaseHubOptions<ChainId> = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const url = urlcat(FIREFLY_BASE_URL, '/v1/wallet_history/transactions', {
            address,
            chains: SUPPORTED_CHAINS,
            filter_spam: 1,
            filter_micro_tx: 0,
            cursor: indicator?.id,
        })
        const res = await fetchJSON<FireflyWalletHistoryAPI.WalletHistoryResponse>(url)
        const data = resolveFireflyResponseData(res)
        const transactions = compact((data?.list ?? []).map((x) => formatWalletHistoryTransaction(x)))
        const nextIndicator = data?.cursor ? createNextIndicator(indicator, data.cursor) : undefined

        return createPageable(transactions, createIndicator(indicator), nextIndicator)
    },
}
