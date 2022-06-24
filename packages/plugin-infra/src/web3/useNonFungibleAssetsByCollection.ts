import { pageableToIterator, NetworkPluginID } from '@masknet/web3-shared-base'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY_LIST } from '@masknet/shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useWeb3Hub } from './useWeb3Hub'

export function useNonFungibleAssetsByCollection<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(address?: string, pluginID?: T, options?: Web3Helper.Web3HubOptionsScope<S, T>) {
    const [assets, setAssets] = useState<Array<Web3Helper.NonFungibleAssetScope<S, T>>>(EMPTY_LIST)
    const [done, setDone] = useState(false)
    const [loading, toggleLoading] = useState(false)
    const [error, setError] = useState<string>()

    const hub = useWeb3Hub(pluginID, options)

    // create iterator
    const iterator = useMemo(() => {
        if (!address || !hub?.getNonFungibleTokensByCollection) return
        setAssets(EMPTY_LIST)
        setDone(false)

        return pageableToIterator(async (indicator) => {
            return hub.getNonFungibleTokensByCollection!(address, {
                indicator,
                size: 50,
                ...options,
            })
        })
    }, [hub?.getNonFungibleTokensByCollection, address, JSON.stringify(options)])

    const next = useCallback(async () => {
        if (!iterator || done) return

        const batchResult: Array<Web3Helper.NonFungibleAssetScope<S, T>> = []
        toggleLoading(true)
        try {
            for (const v of Array.from({ length: options?.size ?? 36 })) {
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
                        batchResult.push(value)
                    }
                }
            }
        } catch (error_) {
            // Uncontrolled error
            setError(error_ as string)
            setDone(true)
        }
        toggleLoading(false)
        setAssets((pred) => [...pred, ...batchResult])
    }, [iterator, done])

    // Execute once after next update
    useEffect(() => {
        if (next) next()
    }, [next])

    const retry = useCallback(() => {
        setAssets(EMPTY_LIST)
        setDone(false)
    }, [])

    return {
        value: assets.filter((x) => (options?.chainId ? x.chainId === options?.chainId : true)),
        next,
        loading,
        done,
        retry,
        error,
    }
}
