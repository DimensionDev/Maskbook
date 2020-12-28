import { AssetDetailed, EtherTokenDetailed, ERC20TokenDetailed, EthereumTokenType } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useAssetsDetailedMerged } from './useAssetsDetailedMerged'

/**
 * Fetch tokens detailed (balance only) from chain
 * @param address
 * @param tokens
 */
export function useAssetsDetailed(tokens: (EtherTokenDetailed | ERC20TokenDetailed)[]) {
    const { value: listOfBalance = [] } = useTokensBalance(
        tokens.filter((x) => x.type === EthereumTokenType.ERC20).map((y) => y.address),
    )
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
