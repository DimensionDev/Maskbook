import { NetworkPluginID, SourceType } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { flattenAsyncIterator, EMPTY_LIST } from '@masknet/shared-base'
import { useNetworkDescriptors } from './useNetworkDescriptors'
import { useWhatChanged } from '@simbathesailor/use-what-changed'

export function useNonFungibleAssets<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
    Indicator = number,
>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T, Indicator>,
) {
    const [assets, setAssets] = useState<Array<Web3Helper.NonFungibleAssetScope<S, T>>>(EMPTY_LIST)
    const [done, setDone] = useState(false)
    const [error, setError] = useState<string>()

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)
    const networks = useNetworkDescriptors(pluginID)

    // create iterator
    const iterator = useMemo(() => {
        if ((!account && !options?.account) || !hub || !networks) return
        if (!hub.getAllNonFungibleAssets) return

        return flattenAsyncIterator(
            networks
                .filter((x) => x.isMainnet)
                .filter((x) => (options?.chainId ? x.chainId === options?.chainId : true))
                .map((x) => {
                    return hub.getAllNonFungibleAssets!(options?.account ?? account, {
                        sourceType: SourceType.Alchemy_EVM,
                        chainId: x.chainId,
                    } as Web3Helper.Web3HubOptions<T>)
                }),
        )
    }, [hub?.getAllNonFungibleAssets, account, options?.account, options?.chainId, networks.length])

    const next = useCallback(async () => {
        if (!iterator) return

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
                        break
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
    }, [iterator])

    useWhatChanged([next, iterator, networks])

    // Execute once after next update
    useEffect(() => {
        if (assets.length) return
        if (next) next()
    }, [next, assets.length])

    const retry = useCallback(() => {
        setAssets([])
        setDone(false)
    }, [])

    useEffect(() => retry(), [account, options?.account, retry])

    return { value: assets, next, done, retry, error }
}
