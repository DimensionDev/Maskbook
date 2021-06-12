import type { Asset, FungibleTokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsMerged } from './useAssetsMerged'

export function useAssetsFromChain(tokens: FungibleTokenDetailed[]) {
    const { value: listOfBalance = [], loading, error, retry } = useTokensBalance(tokens.map((y) => y.address))
    return {
        value: useAssetsMerged(
            // the length not matched in case of error occurs
            listOfBalance.length === tokens.length
                ? listOfBalance.map(
                      (balance, idx): Asset => ({
                          chain: 'eth',
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
