import type { Token, TokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useTokensDetailedMerged } from './useTokensDetailedMerged'

/**
 * Fetch tokens detailed (balance only) from chain
 * @param address
 * @param tokens
 */
export function useTokensDetailed(address: string, tokens: Token[]) {
    const { value: listOfBalance = [] } = useTokensBalance(
        address,
        tokens.map((x) => x.address),
    )
    return useTokensDetailedMerged(
        // The length not matched if error happened
        listOfBalance.length === tokens.length
            ? listOfBalance.map(
                  (balance, idx) =>
                      ({
                          token: tokens[idx],
                          balance,
                      } as TokenDetailed),
              )
            : [],
    )
}
