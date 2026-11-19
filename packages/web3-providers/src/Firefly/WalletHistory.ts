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
import { type ChainId, isValidChainId, SchemaType } from '@masknet/web3-shared-evm'
import { compact } from 'lodash-es'
import urlcat from 'urlcat'
import type { BaseHubOptions } from '../entry-types.js'
import { FIREFLY_BASE_URL, FIREFLY_WALLET_HISTORY_CHAINS } from './constants.js'
import { resolveFireflyResponseData } from './helpers.js'

const SUPPORTED_CHAINS = FIREFLY_WALLET_HISTORY_CHAINS.join(',')

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
// The UI colorizes only `send`/`receive`; every other category falls back to the default color.
const cateTypeMap: Partial<Record<FireflyWalletHistoryAPI.Category, 'send' | 'receive'>> = {
    [FireflyWalletHistoryAPI.Category.TokenReceive]: 'receive',
    [FireflyWalletHistoryAPI.Category.NftReceive]: 'receive',
    [FireflyWalletHistoryAPI.Category.TokenSend]: 'send',
    [FireflyWalletHistoryAPI.Category.NftSend]: 'send',
    // TokenBridge is resolved per transaction: outbound (has sends) vs inbound.
}
const cateNameMap: Record<FireflyWalletHistoryAPI.Category, string> = {
    [FireflyWalletHistoryAPI.Category.TokenReceive]: 'Receive',
    [FireflyWalletHistoryAPI.Category.NftReceive]: 'NFT Receive',
    [FireflyWalletHistoryAPI.Category.TokenSend]: 'Send',
    [FireflyWalletHistoryAPI.Category.NftSend]: 'NFT Send',
    [FireflyWalletHistoryAPI.Category.TokenBridge]: 'Bridge',
    [FireflyWalletHistoryAPI.Category.TokenSwap]: 'Swap',
    [FireflyWalletHistoryAPI.Category.TokenApprove]: 'Approve',
    [FireflyWalletHistoryAPI.Category.TokenRevoke]: 'Revoke',
    [FireflyWalletHistoryAPI.Category.NftMint]: 'NFT Mint',
    [FireflyWalletHistoryAPI.Category.ContractInteraction]: 'Contract Interaction',
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
    const { category } = item
    const isBridge = category === FireflyWalletHistoryAPI.Category.TokenBridge
    const isInboundBridge = isBridge && !item.token_sends?.length
    const type = isInboundBridge ? 'receive' : (typeMap[category] ?? 'contract interaction')
    const assets = compact([
        ...(item.token_receives ?? []).map((x) => formatTokenAsset(x, chainId, 'receive')),
        ...(item.token_sends ?? []).map((x) => formatTokenAsset(x, chainId, 'send')),
        ...(item.nft_receives ?? []).map((x) => formatNftAsset(x, chainId, 'receive')),
        ...(item.nft_sends ?? []).map((x) => formatNftAsset(x, chainId, 'send')),
    ])
    // Prefer the real counterparty over the executed contract address (`to_address`),
    // so the UI shows the actual recipient without an extra Chainbase lookup.
    // Only for plain sends: for swaps/mints/interactions the first outgoing transfer
    // usually goes to a pool or mint contract, and `to_address` is the more useful contract.
    const sendRecipient =
        (
            category === FireflyWalletHistoryAPI.Category.TokenSend ||
            category === FireflyWalletHistoryAPI.Category.NftSend
        ) ?
            item.token_sends?.[0]?.recipient || item.nft_sends?.[0]?.recipient
        :   undefined
    const approveSpender =
        (
            category === FireflyWalletHistoryAPI.Category.TokenApprove ||
            category === FireflyWalletHistoryAPI.Category.TokenRevoke
        ) ?
            item.token_approve?.spender_address
        :   undefined
    const to = sendRecipient || approveSpender || item.to_address
    return {
        id: item.hash,
        hash: item.hash,
        chainId,
        type,
        cateType:
            isBridge ?
                isInboundBridge ? 'receive'
                :   'send'
            :   cateTypeMap[category],
        cateName: cateNameMap[category],
        from: item.from_address,
        to,
        timestamp: Number(item.timestamp) * 1000,
        blockNumber: item.block_number,
        status: statusMap[item.tx_status] ?? TransactionStatusType.NOT_DEPEND,
        assets,
        approveAssets: compact([formatApproveAsset(item, chainId)]),
    }
}

export const FireflyWalletHistory = {
    async getTransactions(
        address: string,
        { indicator, filterSpam }: BaseHubOptions<ChainId> & { filterSpam?: boolean } = {},
    ): Promise<Pageable<Transaction<ChainId, SchemaType>>> {
        const url = urlcat(FIREFLY_BASE_URL, '/v1/wallet_history/transactions', {
            address,
            chains: SUPPORTED_CHAINS,
            filter_spam: filterSpam === false ? 0 : 1,
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
