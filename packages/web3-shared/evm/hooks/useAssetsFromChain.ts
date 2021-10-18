import { first } from 'lodash-es'
import { Asset, EthereumTokenType, FungibleTokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useChainDetailed } from './useChainDetailed'
import { useBalance } from './useBalance'

export function useAssetsFromChain(tokens: FungibleTokenDetailed[]) {
    const balance = useBalance()
    const chainDetailed = useChainDetailed()

    const chain = chainDetailed?.shortName.toLowerCase() ?? 'unknown'
    const nativeToken = first(tokens.filter((x) => x.type === EthereumTokenType.Native))
    const erc20Tokens = tokens.filter((x) => x.type === EthereumTokenType.ERC20)

    const { value: listOfBalance = [], loading, error, retry } = useTokensBalance(erc20Tokens.map((x) => x.address))

    return {
        value: [
            ...(nativeToken
                ? [
                      {
                          chain,
                          token: nativeToken,
                          balance,
                      },
                  ]
                : []),

            // the length not matched in case of error occurs
            ...(listOfBalance.length === erc20Tokens.length
                ? listOfBalance.map(
                      (balance, idx): Asset => ({
                          chain,
                          token: erc20Tokens[idx],
                          balance,
                      }),
                  )
                : []),
        ],
        loading,
        error,
        retry,
    }
}
