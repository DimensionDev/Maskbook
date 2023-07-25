import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNonFungibleCollections } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { isLensCollect, isLensFollower } from '@masknet/web3-shared-evm'
import { produce, type Draft } from 'immer'
import { sum } from 'lodash-es'
import { useMemo, useState } from 'react'

interface Options {
    pluginID: NetworkPluginID
    chainId: Web3Helper.ChainIdAll | undefined
    account: string
    defaultCollectionId?: string
}

export function useCollections({ pluginID, chainId, account, defaultCollectionId }: Options) {
    const [currentCollectionId = defaultCollectionId, setCurrentCollectionId] = useState<string>()
    const {
        data: rawCollections = EMPTY_LIST,
        isLoading: loading,
        error,
        refetch: retry,
    } = useNonFungibleCollections(pluginID, {
        account,
        allChains: true,
        sourceType: SourceType.SimpleHash,
    })

    const merged = useMemo(() => {
        return produce(rawCollections, (draft) => {
            const mergeBy = (name: string, filterFn: (c: Draft<Web3Helper.NonFungibleCollectionAll>) => boolean) => {
                const matchedCollections = draft.filter(filterFn)
                if (matchedCollections.length <= 2) return

                const [theFirst, ...rest] = matchedCollections

                // Merge ids, update name, total up the balance
                theFirst.id = matchedCollections.map((x) => x.id).join(',')
                theFirst.name = name
                theFirst.balance = sum(matchedCollections.map((x) => x.balance || 0))

                // Remove the rest
                draft.splice(0, draft.length, ...draft.filter((x) => !rest.includes(x)))
            }
            mergeBy('Lens Followers', (x) => isLensFollower(x.name))
            mergeBy('Lens Collects', (x) => isLensCollect(x.name))
        })
    }, [rawCollections])

    const collections = useMemo(
        () => (chainId ? merged.filter((x) => x.chainId === chainId) : merged),
        [merged, chainId],
    )

    const currentCollection = currentCollectionId ? merged.find((x) => x.id === currentCollectionId) : undefined

    return {
        collections,
        currentCollection,
        currentCollectionId,
        setCurrentCollectionId,
        loading,
        error,
        retry,
    }
}
