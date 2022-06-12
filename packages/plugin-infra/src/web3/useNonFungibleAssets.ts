import { pageableToIterator, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { flattenAsyncIterator, EMPTY_LIST } from '@masknet/shared-base'
import { useNetworkDescriptors } from './useNetworkDescriptors'

export function useNonFungibleAssets<S extends 'all' | void = void, T extends NetworkPluginID = NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.SchemaTypeScope<S, T>,
    options?: Web3Helper.Web3HubOptionsScope<S, T>,
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
        if (!hub.getNonFungibleTokens) return

        return flattenAsyncIterator(
            networks
                .filter((x) => x.isMainnet)
                .filter((x) => (options?.chainId ? x.chainId === options?.chainId : true))
                .map((x) => {
                    return pageableToIterator(async (indicator) => {
                        if (!hub?.getNonFungibleTokens) return
                        return hub.getNonFungibleTokens(options?.account ?? account, {
                            indicator,
                            size: 50,
                            ...options,
                            chainId: x.chainId,
                        })
                    })
                }),
        )
    }, [hub, account, options?.account, options?.chainId, networks.length])

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

    // Execute once after next update
    useEffect(() => {
        if (next) next()
    }, [next])

    const retry = useCallback(() => {
        setAssets([])
        setDone(false)
    }, [])

    useEffect(() => retry(), [account, options?.account, retry, options?.chainId])

    return { value: assets, next, done, retry, error }
}
