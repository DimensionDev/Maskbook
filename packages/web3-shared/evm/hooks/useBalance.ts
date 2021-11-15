import { useWeb3StateContext } from '../context'
import { useWeb3 } from '../hooks'
import { ChainId, ProviderType, NetworkType } from '../types'
import { useAsync } from 'react-use'
import { getChainIdFromNetworkType } from '../utils'
import { getRPCConstants } from '../constants'
import { first } from 'lodash-es'

/**
 * Get the current block number
 */
export function useBalance() {
    return useWeb3StateContext().balance
}

export function useChainBalance(account: string, chainId: ChainId | null, providerType: ProviderType) {
    const web3 = useWeb3(true, chainId ?? ChainId.Mainnet)
    return useAsync(async () => (chainId ? web3.eth.getBalance(account) : null), [account, chainId, providerType])
}

export function useChainBalanceList(account: string, providerType: ProviderType, disabled: boolean) {
    const web3 = useWeb3(true)
    const chainIdList = Object.keys(NetworkType).map((x) => getChainIdFromNetworkType(x as NetworkType))
    const allRequest = disabled
        ? null
        : chainIdList.map(async (chainId) => {
              const { RPC } = getRPCConstants(chainId)
              const providerURL = first(RPC)
              if (providerURL) web3.setProvider(providerURL)
              return {
                  balance: await web3.eth.getBalance(account),
                  chainId,
              }
          })

    return useAsync(async () => {
        if (!allRequest || disabled) return null
        const balanceList = (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((value) => value) as { balance: string; chainId: ChainId }[]
        return balanceList
    }, [account, providerType, allRequest, disabled])
}
