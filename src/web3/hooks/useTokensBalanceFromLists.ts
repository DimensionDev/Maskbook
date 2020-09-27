import { useTokensFromLists } from './useTokensFromLists'
import { useTokensBalance } from './useTokensBalance'

export function useTokensBalanceFromLists(account: string, lists: string[]) {
    const { tokens } = useTokensFromLists(lists)
    return useTokensBalance(
        account,
        tokens.map((x) => x.address),
    )
}
