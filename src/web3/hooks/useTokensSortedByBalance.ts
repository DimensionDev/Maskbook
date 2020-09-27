import type { Token } from '../types'
import { useTokensBalance } from './useTokensBalance'

export interface SortedByBalanceOptions {
    hasBalance: boolean
}

export function useTokensSortedByBalance(account: string, tokens: Token[], options?: SortedByBalanceOptions) {
    const { hasBalance = true } = options ?? {}
    const { value: listOfBalance = [] } = useTokensBalance(
        account,
        tokens.map((x) => x.address),
    )
    return tokens
        .map((x, i) => ({
            token: x,
            balance: listOfBalance[i] ?? '0',
        }))
        .sort((a, z) => {
            if (a.balance < z.balance) return 1
            if (a.balance > z.balance) return -1
            return 0
        })
        .filter((x) => !hasBalance || x.balance !== '0')
}
