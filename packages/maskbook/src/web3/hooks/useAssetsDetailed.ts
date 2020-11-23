import type { AssetDetailed, EtherTokenDetailed, ERC20TokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'

/**
 * Fetch tokens detailed (balance only) from chain
 * @param address
 * @param tokens
 */
export function useAssetsDetailed(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const { value: listOfBalance = [] } = useTokensBalance(tokens.map((x) => x.address))
    return useAssetsDetailedMerged(
        // the length not matched in the case of error occurs
        listOfBalance.length === tokens.length
            ? listOfBalance.map(
                  (balance, idx) =>
                      ({
                          token: tokens[idx],
                          balance,
                      } as AssetDetailed),
              )
            : [],
    )
}
