import type { AssetDetailed, EtherTokenDetailed, ERC20TokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'

export function useAssetsDetailedChain(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const { value: listOfBalance = [] } = useTokensBalance(tokens.map((y) => y.address))
    return useAssetsDetailedMerged(
        // the length not matched in case of error occurs
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
