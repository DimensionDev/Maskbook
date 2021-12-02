import { first } from 'lodash-unified'
import { Asset, ChainId, EthereumTokenType, FungibleTokenDetailed } from '../types'
import { useTokensBalance } from './useTokensBalance'
import { useChainDetailed } from './useChainDetailed'
import { useBalance } from './useBalance'
import { getChainDetailed } from '../utils'
import { useProviderType } from './useProviderType'
import { useBalances } from './useBalances'
import { useMemo } from 'react'

const emptyList = [] as const
export function useAssetsFromChain(tokens: FungibleTokenDetailed[], chainId?: ChainId) {
    const providerType = useProviderType()
    const balances = useBalances()
    const currentBalance = useBalance()

    const balance = chainId && balances && providerType ? balances[providerType][chainId] : currentBalance

    const chainDetailed = useChainDetailed()
    const passedChainDetailed = getChainDetailed(chainId)

    const chain = passedChainDetailed?.shortName.toLowerCase() ?? chainDetailed?.shortName.toLowerCase() ?? 'unknown'
    const nativeToken = first(tokens.filter((x) => x.type === EthereumTokenType.Native))
    const erc20Tokens = useMemo(() => tokens.filter((x) => x.type === EthereumTokenType.ERC20), [tokens])
    const erc20TokenAddresses = useMemo(() => erc20Tokens.map((x) => x.address), [erc20Tokens])

    const { value: listOfBalance = emptyList, loading, error, retry } = useTokensBalance(erc20TokenAddresses, chainId)

    const assets = useMemo(() => {
        return [
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
        ]
    }, [nativeToken, chain, balance, listOfBalance, erc20Tokens])

    return {
        value: assets,
        loading,
        error,
        retry,
    }
}
