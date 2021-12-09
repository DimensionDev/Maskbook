import { multipliedBy, rightShift } from '@masknet/web3-shared-base'
import { NetworkType, FungibleAssetProvider } from '@masknet/web3-shared-evm'
import { isNil } from 'lodash-unified'
import * as DeBankAPI from '../apis/debank'
import * as ZerionApi from '../apis/zerion'
import { resolveDebankChainName, resolveDebankTransactionType, resolveZerionTransactionsScopeName } from '../pipes'
import {
    DebankTransactionDirection,
    HistoryResponse,
    Transaction,
    ZerionRBDTransactionType,
    ZerionTransactionItem,
    ZerionTransactionStatus,
} from '../types'

export async function getTransactionList(
    address: string,
    network: NetworkType,
    provider: FungibleAssetProvider,
    page?: number,
    size = 30,
): Promise<{
    transactions: Transaction[]
    hasNextPage: boolean
}> {
    if (provider === FungibleAssetProvider.DEBANK) {
        const name = resolveDebankChainName(network)
        if (!name)
            return {
                transactions: [],
                hasNextPage: false,
            }
        const { data, error_code } = await DeBankAPI.getTransactionList(address, name)
        if (error_code !== 0) throw new Error('Fail to load transactions.')
        return {
            transactions: fromDeBank(data),
            hasNextPage: false,
        }
    } else if (provider === FungibleAssetProvider.ZERION) {
        const scope = resolveZerionTransactionsScopeName(network)
        if (!scope)
            return {
                transactions: [],
                hasNextPage: false,
            }
        const { payload, meta } = await ZerionApi.getTransactionList(address, scope, page)
        if (meta.status !== 'ok') throw new Error('Fail to load transactions.')
        return {
            transactions: fromZerion(payload.transactions),
            hasNextPage: payload.transactions.length === size,
        }
    }
    return {
        transactions: [],
        hasNextPage: false,
    }
}

function fromDeBank({ cate_dict, history_list, token_dict }: HistoryResponse['data']) {
    return history_list
        .filter((transaction) => transaction.tx?.name || transaction.cate_id)
        .filter(({ cate_id }) => cate_id !== 'approve')
        .map((transaction) => {
            let type = transaction.tx?.name
            if (!type && !isNil(transaction.cate_id)) {
                type = cate_dict[transaction.cate_id].en
            } else if (type === '') {
                type = 'contract interaction'
            }
            return {
                type,
                id: transaction.id,
                timeAt: new Date(transaction.time_at * 1000),
                toAddress: transaction.other_addr,
                failed: transaction.tx?.status === 0,
                pairs: [
                    ...transaction.sends.map(({ amount, token_id }) => ({
                        name: token_dict[token_id].name,
                        symbol: token_dict[token_id].optimized_symbol,
                        address: token_id,
                        direction: DebankTransactionDirection.SEND,
                        amount,
                        logoURI: token_dict[token_id].logo_url,
                    })),
                    ...transaction.receives.map(({ amount, token_id }) => ({
                        name: token_dict[token_id].name,
                        symbol: token_dict[token_id].optimized_symbol,
                        address: token_id,
                        direction: DebankTransactionDirection.RECEIVE,
                        amount,
                        logoURI: token_dict[token_id].logo_url,
                    })),
                ],
                gasFee: transaction.tx
                    ? { eth: transaction.tx.eth_gas_fee, usd: transaction.tx.usd_gas_fee }
                    : undefined,
                transactionType: resolveDebankTransactionType(transaction.cate_id),
            }
        })
}

function fromZerion(data: ZerionTransactionItem[]) {
    return data
        .filter(({ type }) => type !== ZerionRBDTransactionType.AUTHORIZE)
        .map((transaction) => {
            const ethGasFee = rightShift(transaction.fee?.value ?? 0, -18).toString()
            const usdGasFee = multipliedBy(ethGasFee, transaction.fee?.price ?? 0).toString()

            return {
                type: transaction.type,
                id: transaction.hash,
                timeAt: new Date(transaction.mined_at * 1000),
                toAddress: transaction.address_to ?? '',
                failed: transaction.status === ZerionTransactionStatus.FAILED,
                pairs:
                    transaction.changes?.map(({ asset, direction, value }) => {
                        return {
                            name: asset.name,
                            symbol: asset.symbol,
                            address: asset.asset_code,
                            direction,
                            amount: rightShift(value, asset.decimals).toNumber(),
                            logoURI: asset.icon_url,
                        }
                    }) ?? [],
                gasFee: {
                    eth: Number(ethGasFee),
                    usd: Number(usdGasFee),
                },
                transactionType: transaction.type,
            }
        })
}
