import type { NonFungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import { useAsyncRetry } from 'react-use'
import { asyncIteratorToArray, EMPTY_LIST } from '@masknet/shared-base'
import type { NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { asyncIteratorMerge } from '@masknet/shared-base'
import { useNetworkDescriptors } from './useNetworkDescriptors'

export function useNonFungibleAssets<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator = number,
>(
export function useNonFungibleAssets<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T, Indicator>,
) {
    const account = useAccount(pluginID, options?.account)
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
    options?: Web3Helper.Web3HubOptions<T>,
): {
    value: Array<NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    next: () => void
    done: boolean
    retry: () => void
    error?: string
} {
    const [assets, setAssets] = useState<
        Array<NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    >([])
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string>()
    type GetAllNonFungibleAssets = (
        address: string,
        options?: Web3Helper.Web3HubOptions<T>,
    ) => AsyncIterableIterator<
        NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)
    const networks = useNetworkDescriptors(pluginID)

    // create iterator
    const iterator = useMemo(() => {
        if ((!account && !options?.account) || !hub || !networks) return
        return asyncIteratorMerge(
            // should use networks, this code for debug
            [networks[0]]
                .filter((x) => x.isMainnet)
                .map((x) => {
                    return (hub.getAllNonFungibleAssets as GetAllNonFungibleAssets)(options?.account ?? account, {
                        chainId: x.chainId,
                    } as Web3Helper.Web3HubOptions<T>)
                }),
        )
    }, [hub, account, options?.account, networks])

    const next = useCallback(async () => {
        if (!iterator || done) return

        try {
            for (const v of Array.from({ length: 48 })) {
                const { value, done: iteratorDone } = await iterator.next()
                if (value instanceof Error) {
                    // Controlled error
                    setError(value.message)
                    break
                } else {
                    if (iteratorDone) {
                        setDone(true)
                    }
                    if (!iteratorDone && value) {
                        setAssets((pred) => [...pred, value])
                    }
                }
            }
        } catch (error_) {
            // Uncontrolled error
            setError(error_ as string)
            setDone(true)
        }
    }, [iterator, done])

    // Execute once after next update
    useEffect(() => {
        if (next) next()
    }, [next])

    const retry = useCallback(() => {
        setAssets([])
        setDone(false)
    }, [])

    return { value: assets, next, done, retry, error }
}
