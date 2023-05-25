import { EMPTY_LIST, type NetworkPluginID } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useNonFungibleCollections } from '@masknet/web3-hooks-base'
import { SourceType } from '@masknet/web3-shared-base'
import { isLensCollect, isLensFollower } from '@masknet/web3-shared-evm'
import { sum } from 'lodash-es'
import { useMemo, useState } from 'react'

export function useCollections(pluginID: NetworkPluginID, chainId: Web3Helper.ChainIdAll | undefined, account: string) {
    const [currentCollectionId, setCurrentCollectionId] = useState<string>()
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

    const mergedCollections = useMemo(() => {
        let newCollections = rawCollections.slice(0)

        const mergeBy = (name: string, filterFn: (c: Web3Helper.NonFungibleCollectionAll) => boolean) => {
            const matchedCollections = newCollections.filter(filterFn)
            if (matchedCollections.length <= 2) return

            const theFirst = matchedCollections[0]
            const theFirstIndex = newCollections.indexOf(theFirst)
            const rest = matchedCollections.slice(1)
            newCollections[theFirstIndex] = {
                ...theFirst,
                // Merge ids, update name, total up the balance
                id: matchedCollections.map((x) => x.id).join(','),
                name,
                balance: sum(matchedCollections.map((x) => x.balance || 0)),
            }

            // Remove the rest
            newCollections = newCollections.filter((x) => !rest.includes(x))
        }
        mergeBy('Lens Followers', (x) => isLensFollower(x.name))
        mergeBy('Lens Collects', (x) => isLensCollect(x.name))
        return newCollections.length === rawCollections.length ? rawCollections : newCollections
    }, [rawCollections])

    const collections = useMemo(
        () => (chainId ? mergedCollections.filter((x) => x.chainId === chainId) : mergedCollections),
        [mergedCollections, chainId],
    )

    const currentCollection = mergedCollections.find((x) => x.id === currentCollectionId)

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
