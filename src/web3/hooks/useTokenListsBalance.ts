import { useTokenLists } from './useTokenLists'
import { useTokensBalance } from './useTokensBalance'

export function useTokenListsBalance(account: string, lists: string[]) {
    const { tokens } = useTokenLists(lists)
    return useTokensBalance(
        account,
        tokens.map((x) => x.address),
    )
}
