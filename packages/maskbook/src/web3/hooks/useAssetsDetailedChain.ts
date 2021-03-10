import type { AssetDetailed, EtherTokenDetailed, ERC20TokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'

export function useAssetsDetailedChain(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const { value: listOfBalance = [], loading, error, retry } = useTokensBalance(tokens.map((y) => y.address))
    return {
        value: useAssetsDetailedMerged(
            // the length not matched in case of error occurs
            listOfBalance.length === tokens.length
                ? listOfBalance.map(
                      (balance: string, idx: number) =>
                          ({
                              chain: 'eth',
                              token: tokens[idx],
                              balance,
                          } as AssetDetailed),
                  )
                : [],
        ),
        loading,
        error,
        retry,
    }
}
