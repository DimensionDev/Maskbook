import { compact, isNil, memoize } from 'lodash-es'
import {
    type ChainId,
    formatEthereumAddress,
    isNativeTokenAddress,
    SchemaType,
    ZERO_ADDRESS,
    isValidAddress,
} from '@masknet/web3-shared-evm'
import {
    CurrencyType,
    type FungibleAsset,
    multipliedBy,
    rightShift,
    toFixed,
    TokenType,
    type Transaction,
    isSameAddress,
    TransactionStatusType,
} from '@masknet/web3-shared-base'
import { EVMChainResolver } from '../Web3/EVM/apis/ResolverAPI.js'
import {
    DebankTransactionDirection,
    type HistoryResponse,
    type TransferringAsset,
    type WalletTokenRecord,
} from './types.js'
import { DEBANK_CHAIN_TO_CHAIN_ID_MAP } from './constants.js'

export function formatAssets(data: WalletTokenRecord[]): Array<FungibleAsset<ChainId, SchemaType>> {
    const resolveNativeAddress = memoize((chainId: ChainId) => {
        try {
            // chainId is beyond builtin chainIds
            return EVMChainResolver.nativeCurrency(chainId)?.address || ZERO_ADDRESS
        } catch {
            return ZERO_ADDRESS
        }
    })

    return data
        .filter((x) => DEBANK_CHAIN_TO_CHAIN_ID_MAP[x.chain])
        .map((x) => {
            const chainId = DEBANK_CHAIN_TO_CHAIN_ID_MAP[x.chain]
            const address = x.id in DEBANK_CHAIN_TO_CHAIN_ID_MAP ? resolveNativeAddress(chainId) : x.id

            return {
                id: x.id,
                address: formatEthereumAddress(address),
                chainId,
                type: TokenType.Fungible,
                schema: isNativeTokenAddress(address) ? SchemaType.Native : SchemaType.ERC20,
                decimals: x.decimals,
                name: x.name.replace('(PoS)', ''),
                symbol: x.symbol,
                balance: rightShift(x.amount, x.decimals).toFixed(),
                price: {
                    [CurrencyType.USD]: toFixed(x.price),
                },
                value: {
                    [CurrencyType.USD]: multipliedBy(x.price ?? 0, x.amount).toFixed(),
                },
                logoURL: x.logo_url,
            }
        })
}

function toTxAsset(
    { token_id, amount }: TransferringAsset,
    chainId: ChainId,
    token_dict: HistoryResponse['data']['token_dict'],
    direction: DebankTransactionDirection,
) {
    const token = token_dict[token_id]
    // token_dict might not contain value to current token_id
    if (!token) return null
    const schema =
        token.decimals ?
            (
                isValidAddress(token.id) // for native token, token.id is symbol. e.g `matic` for Polygon
            ) ?
                SchemaType.ERC20
            :   SchemaType.Native
        : token.is_erc721 ? SchemaType.ERC721
        : SchemaType.ERC1155

    if (process.env.NODE_ENV === 'development') {
        console.assert(token, `[Debank] no matching token in token_dict with token_id ${token_id}`)
    }
    const fallbackName = token.is_erc1155 || token.is_erc721 ? 'Unknown NFT' : 'Unknown Token'
    return {
        id: token_id,
        chainId,
        type: token.decimals ? TokenType.Fungible : TokenType.NonFungible,
        schema,
        name: token.name || token.collection?.name || fallbackName,
        symbol: token.optimized_symbol || token.collection?.name || fallbackName,
        address: token.decimals ? token_id : token.contract_id,
        decimals: token.decimals || 1,
        direction,
        amount: amount?.toString(),
        logoURI: token.logo_url,
    }
}

/** 0: failed 1: succeed */
function normalizeTxStatus(status: 0 | 1): TransactionStatusType {
    const map = {
        0: TransactionStatusType.FAILED,
        1: TransactionStatusType.SUCCEED,
    }
    return map[status]
}

export function formatTransactions(
    { cate_dict, history_list, token_dict }: HistoryResponse['data'],
    ownerAddress: string,
): Array<Transaction<ChainId, SchemaType>> {
    const transactions = history_list.map((transaction): Transaction<ChainId, SchemaType> | undefined => {
        let txType = transaction.tx?.name
        if (!txType && !isNil(transaction.cate_id)) {
            txType = cate_dict[transaction.cate_id].name
        } else if (txType === '') {
            txType = 'contract interaction'
        }

        const chainId = DEBANK_CHAIN_TO_CHAIN_ID_MAP[transaction.chain]
        if (!chainId) return

        if (isSameAddress(transaction.sends[0]?.to_addr, ZERO_ADDRESS)) {
            txType = 'burn'
        }
        const isIn = transaction.cate_id === 'receive'
        const from = transaction.tx?.from_addr ?? (isIn ? transaction.other_addr : '')
        const to = isIn ? ownerAddress : transaction.other_addr
        const { SEND, RECEIVE } = DebankTransactionDirection
        return {
            id: transaction.id,
            chainId,
            type: txType,
            cateType: transaction.cate_id,
            cateName:
                transaction.cate_id ?
                    cate_dict[transaction.cate_id].name
                :   transaction.tx?.name || 'Contract Interaction',
            timestamp: transaction.time_at * 1000,
            from,
            to,
            status: normalizeTxStatus(transaction.tx?.status!),
            assets: compact([
                ...transaction.sends.map((asset) => toTxAsset(asset, chainId, token_dict, SEND)),
                ...transaction.receives.map((asset) => toTxAsset(asset, chainId, token_dict, RECEIVE)),
            ]),
            fee:
                transaction.tx ?
                    { eth: transaction.tx.eth_gas_fee?.toString(), usd: transaction.tx.usd_gas_fee?.toString() }
                :   undefined,
            isScam: transaction.is_scam,
        }
    })
    return compact(transactions)
}

export function resolveDeBankAssetIdReversed(id: string) {
    if (id === 'bnb') return 'bsc'
    if (id === 'Conflux') return 'cfx'
    return id
}
