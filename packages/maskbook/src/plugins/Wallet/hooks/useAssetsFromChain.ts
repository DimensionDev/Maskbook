import { useTokensBalance } from '../../../web3/hooks/useTokensBalance'
import type { FungibleTokenDetailed } from '../../../web3/types'
import type { Asset } from '../types'
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
