import { isNil } from 'lodash-unified'
import { ChainId, chainResolver, createNativeToken, SchemaType } from '@masknet/web3-shared-evm'
import {
    CurrencyType,
    TokenType,
    FungibleAsset,
    multipliedBy,
    rightShift,
    toFixed,
    Transaction,
} from '@masknet/web3-shared-base'
import DeBank from '@masknet/web3-constants/evm/debank.json'
import { DebankTransactionDirection, HistoryResponse, WalletTokenRecord } from './type'

export function formatAssets(data: WalletTokenRecord[]): FungibleAsset<ChainId, SchemaType>[] {
    const supportedChains = Object.values(DeBank.CHAIN_ID).filter(Boolean)

    return data.reduce((list: FungibleAsset<ChainId, SchemaType>[], y) => {
        if (!y.is_verified) return list
        const chainIdFromChain = chainResolver.chainId(y.chain)
        if (!chainIdFromChain) return list
        const address = supportedChains.includes(y.id) ? createNativeToken(chainIdFromChain).address : y.id

        return [
            ...list,
            {
                id: address,
                address: address,
                chainId: chainIdFromChain,
                type: TokenType.Fungible,
                schema: SchemaType.ERC20,
                decimals: y.decimals,
                name: y.name,
                symbol: y.symbol,
                balance: rightShift(y.amount, y.decimals).toFixed(),
                price: {
                    [CurrencyType.USD]: toFixed(y.price),
                },
                value: {
                    [CurrencyType.USD]: multipliedBy(y.price ?? 0, y.amount).toFixed(),
                },
                logoURI: y.logo_url,
            },
        ]
    }, [])
}

export function formatTransactions(
    chainId: ChainId,
    { cate_dict, history_list, token_dict }: HistoryResponse['data'],
): Transaction<ChainId, SchemaType>[] {
    return history_list
        .filter((transaction) => transaction.tx?.name || transaction.cate_id)
        .filter(({ cate_id }) => cate_id !== 'approve')
        .map((transaction) => {
            let type = transaction.tx?.name
            if (!type && !isNil(transaction.cate_id)) {
                type = cate_dict[transaction.cate_id].name
            } else if (type === '') {
                type = 'contract interaction'
            }
            return {
                id: transaction.id,
                chainId,
                type,
                filterType: transaction.cate_id,
                timestamp: transaction.time_at,
                from: transaction.tx?.from_addr ?? '',
                to: transaction.other_addr,
                status: transaction.tx?.status ?? 0,
                tokens: [
                    ...transaction.sends.map(({ amount, token_id }) => ({
                        id: token_id,
                        chainId,
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                        name: token_dict[token_id]?.name ?? 'Unknown Token',
                        symbol: token_dict[token_id]?.optimized_symbol,
                        address: token_id,
                        direction: DebankTransactionDirection.SEND,
                        amount: amount.toString(),
                        logoURI: token_dict[token_id].logo_url,
                    })),
                    ...transaction.receives.map(({ amount, token_id }) => ({
                        id: token_id,
                        chainId,
                        type: TokenType.Fungible,
                        schema: SchemaType.ERC20,
                        name: token_dict[token_id]?.name ?? 'Unknown Token',
                        symbol: token_dict[token_id]?.optimized_symbol,
                        address: token_id,
                        direction: DebankTransactionDirection.RECEIVE,
                        amount: amount.toString(),
                        logoURI: token_dict[token_id]?.logo_url,
                    })),
                ],
                fee: transaction.tx
                    ? { eth: transaction.tx.eth_gas_fee.toString(), usd: transaction.tx.usd_gas_fee.toString() }
                    : undefined,
            }
        })
}
