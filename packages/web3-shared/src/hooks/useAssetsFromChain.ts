import type { Asset, FungibleTokenDetailed } from '../types'
import { useChainDetailed } from './useChainDetailed'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsMerged } from './useAssetsMerged'

export function useAssetsFromChain(tokens: FungibleTokenDetailed[]) {
    const chainDetailed = useChainDetailed()
    const { value: listOfBalance = [], loading, error, retry } = useTokensBalance(tokens.map((y) => y.address))
    return {
        value: useAssetsMerged(
            // the length not matched in case of error occurs
            listOfBalance.length === tokens.length
                ? listOfBalance.map(
                      (balance, idx): Asset => ({
                          chain: chainDetailed?.chain.toLowerCase() ?? 'eth',
                          token: tokens[idx],
                          balance,
                      }),
                  )
                : [],
        ),
        loading,
        error,
        retry,
    }
}
