import { TransactionProvider } from '../types'
import * as DeBankAPI from './debank'
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

function fromDeBank({ history_list, token_dict }: DeBankAPI.HISTORY_RESPONSE['data']) {
    return history_list.map((transaction) => {
        return {
            type: transaction.tx.name === '' ? 'contract' : transaction.tx.name,
            id: transaction.id,
            timeAt: new Date(transaction.time_at * 1000),
            toAddress: transaction.other_addr,
            pairs: [
                ...transaction.sends.map(({ amount, token_id }) => ({
                    name: token_dict[token_id].name,
                    symbol: token_dict[token_id].optimized_symbol,
                    logo_url: token_dict[token_id].logo_url,
                    direction: 'send',
                    amount,
                })),
                ...transaction.receives.map(({ amount, token_id }) => ({
                    name: token_dict[token_id].name,
                    symbol: token_dict[token_id].optimized_symbol,
                    logo_url: token_dict[token_id].logo_url,
                    direction: 'receive',
                    amount,
                })),
            ],
            gasFee: {
                eth: transaction.tx.eth_gas_fee,
                usd: transaction.tx.usd_gas_fee,
            },
        }
    })
}
