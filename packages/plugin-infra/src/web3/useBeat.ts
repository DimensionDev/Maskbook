import type { DependencyList } from 'react'
import type { AsyncStateRetry } from 'react-use/lib/useAsyncRetry'
import { useBeatRetry } from '@masknet/web3-shared-base'
import { useWeb3State } from '..'
import { useChainId } from './useChainId'
import type { NetworkPluginID } from '../web3-types'

const DEFAULT_SINGLE_BLOCK_DELAY = 15 * 1000
const DEFAULT_DOUBLE_BLOCK_DELAY = DEFAULT_SINGLE_BLOCK_DELAY * 2

export function useSingleBlockBeatRetry<T>(
    pluginID: NetworkPluginID,
    fn: () => Promise<T>,
    deps: DependencyList = [],
): AsyncStateRetry<T> {
    const chainId = useChainId(pluginID)
    const { Utils } = useWeb3State(pluginID)
    return useBeatRetry(fn, Utils?.getAverageBlockDelay?.(chainId) ?? DEFAULT_SINGLE_BLOCK_DELAY, deps)
}

export function useDoubleBlockBeatRetry<T>(
    pluginID: NetworkPluginID,
    fn: () => Promise<T>,
    deps: DependencyList = [],
): AsyncStateRetry<T> {
    const chainId = useChainId(pluginID)
    const { Utils } = useWeb3State(pluginID)
    return useBeatRetry(fn, Utils?.getAverageBlockDelay?.(chainId, 2) ?? DEFAULT_DOUBLE_BLOCK_DELAY, deps)
}
