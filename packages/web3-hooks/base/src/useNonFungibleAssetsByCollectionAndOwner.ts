import { useCallback, useEffect, useMemo, useState } from 'react'
import { EMPTY_LIST, type NetworkPluginID, pageableToIterator } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import type { HubOptions } from '@masknet/web3-providers/types'
import { useWeb3Hub } from './useWeb3Hub.js'

export function useNonFungibleAssetsByCollectionAndOwner<
    S extends 'all' | void = void,
    T extends NetworkPluginID = NetworkPluginID,
>(collectionId?: string, owner?: string, pluginID?: T, options?: HubOptions<T>) {
    const [assets, setAssets] = useState<Array<Web3Helper.NonFungibleAssetScope<S, T>>>(EMPTY_LIST)
    const [done, setDone] = useState(false)
    const [loading, toggleLoading] = useState(false)
    const [error, setError] = useState<string>()
    const Hub = useWeb3Hub(pluginID, options)

    // create iterator
    const iterator = useMemo(() => {
        setAssets(EMPTY_LIST)
        setDone(false)

        return pageableToIterator(async (indicator) => {
            return Hub.getNonFungibleAssetsByCollectionAndOwner!(collectionId ?? '', owner ?? '', {
                indicator,
                size: 50,
            })
        })
    }, [collectionId, Hub])

    const next = useCallback(async () => {
        if (!iterator || done) return

        const batchResult: Array<Web3Helper.NonFungibleAssetScope<S, T>> = []
        toggleLoading(true)
        try {
            for (const _ of Array.from({ length: options?.size ?? 36 })) {
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
        setAssets((pred) => [...pred, ...batchResult].sort((a, b) => (a.tokenId > b.tokenId ? 1 : -1)))
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
