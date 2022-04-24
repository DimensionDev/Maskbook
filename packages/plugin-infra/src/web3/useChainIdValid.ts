import { useMemo } from 'react'
import { useChainId } from './useChainId'
import { useWeb3State } from './useWeb3State'
import { useAccount } from './useAccount'
import type { NetworkPluginID } from '../web3-types'
import type { Web3Helper } from '../web3-helpers'

export function useChainIdValid<T extends NetworkPluginID>(
    pluginID?: T,
    expectedChainId?: Web3Helper.Definition[T]['ChainId'],
) {
    const chainId = useChainId(pluginID, expectedChainId)
    const account = useAccount(pluginID)
    const { Utils } = useWeb3State(pluginID)

    // @ts-ignore
    return (!account || Utils?.isChainIdValid?.(chainId, process.env.NODE_ENV === 'development')) ?? false
}
