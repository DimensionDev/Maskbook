import { TransactionProvider } from "../types";
import * as DeBankAPI from './debank'

// TOOD:
// unify transaction type from different transaction provider
export interface Transaction {
    id: string
}


export async function getTransactionList(address: string, provider: TransactionProvider) {
    if (provider === TransactionProvider.DEBANK) {
        const { data, error_code } = await DeBankAPI.getTransactionList(address)
        if (error_code !== 0) throw new Error('Fail to load transactions.')
        const { cate_dict, history_list, project_dict, token_dict } = data
        return history_list as Transaction[]
    }
    return []
}
