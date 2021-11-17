import { first } from 'lodash-es'
import { useAsync } from 'react-use'
import { useWeb3StateContext } from '../context'
import { useWeb3 } from '../hooks'
import { ChainId, ProviderType, NetworkType } from '../types'
import { getChainIdFromNetworkType } from '../utils'
import { getRPCConstants } from '../constants'

/**
 * Get the current block number
 */
export function useBalance() {
    return useWeb3StateContext().balance
}

export function useChainBalance(account: string, chainId: ChainId, providerType: ProviderType) {
    const web3 = useWeb3(true, chainId)
    return useAsync(async () => (account ? web3.eth.getBalance(account) : null), [account, chainId, providerType])
}

export function useChainBalanceList(account: string, providerType: ProviderType) {
    const web3 = useWeb3(true)
    const chainIdList = Object.keys(NetworkType).map((x) => getChainIdFromNetworkType(x as NetworkType))

    return useAsync(async () => {
        if (!account) return null
        const allRequest = chainIdList.map(async (chainId) => {
            const { RPC } = getRPCConstants(chainId)
            const providerURL = first(RPC)
            let balance = '0'
            if (providerURL) {
                web3.setProvider(providerURL)
                balance = await web3.eth.getBalance(account)
            }
            return { balance, chainId }
        })
        return (await Promise.allSettled(allRequest))
            .map((x) => (x.status === 'fulfilled' ? x.value : undefined))
            .filter((value) => value) as { balance: string; chainId: ChainId }[]
    }, [account, providerType])
}
