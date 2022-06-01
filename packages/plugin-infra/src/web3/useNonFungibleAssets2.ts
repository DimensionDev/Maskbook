import type { NonFungibleAsset, NetworkPluginID } from '@masknet/web3-shared-base'
import type { Web3Helper } from '../web3-helpers'
import { useAccount } from './useAccount'
import { useWeb3Hub } from './useWeb3Hub'
import { useCallback, useMemo, useState } from 'react'

export function useNonFungibleAssets2<T extends NetworkPluginID>(
    pluginID?: T,
    schemaType?: Web3Helper.Definition[T]['SchemaType'],
    options?: Web3Helper.Web3HubOptions<T>,
): {
    value: Array<NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    next: () => void
    done: boolean
    retry: () => void
} {
    const [assets, setAssets] = useState<
        Array<NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>>
    >([])
    const [done, setDone] = useState(false)
    type GetAllNonFungibleAssets = (
        address: string,
    ) => AsyncIterableIterator<
        NonFungibleAsset<Web3Helper.Definition[T]['ChainId'], Web3Helper.Definition[T]['SchemaType']>
    >

    const account = useAccount(pluginID)
    const hub = useWeb3Hub(pluginID, options)

    const iterator = useMemo(() => {
        if ((!account && !options?.account) || !hub) return
        return (hub.getAllNonFungibleAssets as GetAllNonFungibleAssets)(options?.account ?? account)
    }, [hub, account, options?.account])

    const next = useCallback(async () => {
        if (!iterator || done) return
        const { value, done: iteratorDone } = await iterator.next()
        if (iteratorDone) {
            setDone(true)
        }
        if (!iteratorDone && value) {
            setAssets((pred) => [...pred, value])
        }
    }, [iterator, done])

    const retry = useCallback(() => {
        setAssets([])
        setDone(false)
    }, [])

    return { value: assets, next, done, retry }
}
