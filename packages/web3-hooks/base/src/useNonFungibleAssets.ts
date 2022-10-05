import { useCallback, useEffect, useMemo, useState } from 'react'
import { useUpdateEffect } from 'react-use'
import type { Web3Helper } from '@masknet/web3-helpers'
import { flattenAsyncIterator, EMPTY_LIST } from '@masknet/shared-base'
import { pageableToIterator } from '@masknet/web3-shared-base'
import type { NetworkPluginID } from '@masknet/shared-base'
import { useAccount } from './useAccount.js'
import { useWeb3Hub } from './useWeb3Hub.js'
import { useNetworkDescriptors } from './useNetworkDescriptors.js'

export function useNonFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
) {
    const [assets, setAssets] = useState<Array<Web3Helper.NonFungibleAssetScope<S, T>>>(EMPTY_LIST)
    const [done, setDone] = useState(false)
    const [loading, toggleLoading] = useState(false)
    const [error, setError] = useState<string>()

    const account = useAccount(pluginID, options?.account)
    const hub = useWeb3Hub(pluginID)
    const networks = useNetworkDescriptors(pluginID)

    // create iterator
    const iterator = useMemo(() => {
        if (!account || !hub?.getNonFungibleAssets || !networks) return
        setAssets(EMPTY_LIST)
        setDone(false)
        return flattenAsyncIterator(
            networks
                .filter((x) => x.isMainnet)
                .filter((x) => (options?.chainId ? x.chainId === options.chainId : true))
                .map((x) => {
                    return pageableToIterator(async (indicator) => {
                        return hub.getNonFungibleAssets!(account, {
                            indicator,
                            size: 50,
                            ...options,
                            chainId: x.chainId,
                        })
                    })
                }),
        )
    }, [hub?.getNonFungibleAssets, account, JSON.stringify(options), networks.length])

    const next = useCallback(async () => {
        if (!iterator || done) return
        setError(undefined)
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
        setAssets((pred) => {
            return [...pred, ...batchResult]
        })
        toggleLoading(false)
    }, [iterator, done])

    // Execute once after next update
    useEffect(() => {
        if (next) next()
    }, [next])

    // clear assets after account updated
    useUpdateEffect(() => {
        setAssets([])
    }, [account])

    const retry = useCallback(() => {
        setError(undefined)
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
