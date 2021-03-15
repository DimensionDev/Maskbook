import { TransactionProvider } from '../types'
import * as DeBankAPI from '../apis/debank'
import { isNil } from 'lodash-es'
// TOOD:
// unify transaction type from different transaction provider
export type Transaction = ReturnType<typeof fromDeBank>[number]

export async function getTransactionList(address: string, provider: TransactionProvider): Promise<Transaction[]> {
    if (provider === TransactionProvider.DEBANK) {
        const { data, error_code } = await DeBankAPI.getTransactionList(address)
        if (error_code !== 0) throw new Error('Fail to load transactions.')
        return fromDeBank(data)
    }
    return []
}

function fromDeBank({ cate_dict, history_list, token_dict }: DeBankAPI.HISTORY_RESPONSE['data']) {
    return history_list
        .filter((transaction) => transaction.tx?.name ?? transaction.cate_id)
        .filter(({ cate_id }) => cate_id !== 'approve')
        .map((transaction) => {
            let type = transaction.tx?.name
            if (isNil(type) && !isNil(transaction.cate_id)) {
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
                    ...transaction.sends
                        .filter(({ token_id }) => token_dict[token_id].is_verified)
                        .map(({ amount, token_id }) => ({
                            name: token_dict[token_id].name,
                            symbol: token_dict[token_id].optimized_symbol,
                            address: token_id,
                            direction: 'send',
                            amount,
                        })),
                    ...transaction.receives
                        .filter(({ token_id }) => token_dict[token_id].is_verified)
                        .map(({ amount, token_id }) => ({
                            name: token_dict[token_id].name,
                            symbol: token_dict[token_id].optimized_symbol,
                            address: token_id,
                            direction: 'receive',
                            amount,
                        })),
                ],
                gasFee: transaction.tx
                    ? { eth: transaction.tx.eth_gas_fee, usd: transaction.tx.usd_gas_fee }
                    : undefined,
            }
        })
}
