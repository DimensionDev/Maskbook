import type { FungibleTokenDetailed } from '@dimensiondev/web3-shared'
import { useTokensBalance } from '@dimensiondev/web3-shared'
import { useAssetsMerged } from '../../../../../maskbook/src/plugins/Wallet/hooks/useAssetsMerged'
import type { Asset } from '../types'

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
