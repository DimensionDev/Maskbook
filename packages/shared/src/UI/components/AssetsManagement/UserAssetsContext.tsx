import { useWeb3ProfileHiddenSettings } from '@masknet/shared'
import { createIndicator, EMPTY_LIST, type NetworkPluginID, type PageIndicator } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Hub } from '@masknet/web3-hooks-base'
import { CollectionType } from '@masknet/web3-providers/types'
import { chunk, sum, take } from 'lodash-es'
import {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type PropsWithChildren,
    type MutableRefObject,
} from 'react'
import {
    assetsReducer,
    createAssetsState,
    initialAssetsState,
    type AssetsReducerState,
    type AssetsState,
} from './assetsReducer.js'

interface AssetsContextOptions {
    assetsMapRef: MutableRefObject<Record<string, AssetsState>>
    getAssets(id: string): AssetsState
    /** Get verified-by marketplaces */
    getVerifiedBy(id: string): readonly string[]
    loadAssets(collection: Web3Helper.NonFungibleCollectionAll): Promise<void>
    loadVerifiedBy(id: string): Promise<void>
    isHiddenAddress: boolean
    isAllHidden: boolean
}

export const AssetsContext = createContext<AssetsContextOptions>({
    assetsMapRef: { current: {} },
    getAssets: () => ({ loading: false, finished: false, assets: [] }),
    getVerifiedBy: () => EMPTY_LIST,
    loadAssets: () => Promise.resolve(),
    loadVerifiedBy: () => Promise.resolve(),
    isHiddenAddress: false,
    isAllHidden: false,
})

interface Props {
    pluginID: NetworkPluginID
    address: string
    userId?: string
    persona?: string
}

/** Min merged collection chunk size */
const CHUNK_SIZE = 8

function joinKeys(ids: string[]) {
    return ids.join('_').toLowerCase()
}
function getAssetsTotal(map: Record<string, AssetsState>) {
    return sum(Object.values(map).map((x) => x.assets.length))
}

export const UserAssetsProvider = memo<PropsWithChildren<Props>>(({ pluginID, userId, address, persona, children }) => {
    const [{ assetsMap, verifiedMap }, dispatch] = useReducer(assetsReducer, initialAssetsState)
    const indicatorMapRef = useRef<Map<string, PageIndicator | undefined>>(new Map())
    const assetsMapRef = useRef<AssetsReducerState['assetsMap']>({})
    const verifiedMapRef = useRef<AssetsReducerState['verifiedMap']>({})
    useEffect(() => {
        assetsMapRef.current = assetsMap
        verifiedMapRef.current = verifiedMap
    })
    const { isHiddenAddress, hiddenList } = useWeb3ProfileHiddenSettings(userId?.toLowerCase(), persona, {
        address,
        hiddenAddressesKey: 'NFTs',
        collectionKey: CollectionType.NFTs,
    })

    // A mapping that contains listing assets only
    const listingAssetsMap = useMemo(() => {
        if (!hiddenList.length) return assetsMap
        const listingMap: Record<string, AssetsState> = { ...assetsMap }
        let updated = false
        for (const id in assetsMap) {
            const originalAssets = assetsMap[id].assets
            const newAssets = originalAssets.filter((x) => !hiddenList.includes(joinKeys([x.address, x.tokenId])))
            if (newAssets.length !== originalAssets.length) {
                listingMap[id] = { ...listingMap[id], assets: newAssets }
                updated = true
            }
        }
        // Update accordingly
        return updated ? listingMap : assetsMap
    }, [assetsMap, hiddenList])

    const isAllHidden = useMemo(() => {
        if (!hiddenList.length || getAssetsTotal(assetsMap) === 0) return false
        return getAssetsTotal(listingAssetsMap) === 0
    }, [assetsMap, listingAssetsMap, !hiddenList.length])

    const hub = useWeb3Hub(pluginID)
    // We load merged collections with iterators
    const assetsLoaderIterators = useRef<Map<string, AsyncGenerator<undefined, void>>>(new Map())
    const loadAssetsViaHub = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll, collectionId?: string) => {
            if (!collection.id) return

            const { id, chainId } = collection
            const realId = collectionId ?? id
            const assetsState = assetsMapRef.current[id]
            if (!hub?.getNonFungibleAssetsByCollectionAndOwner) return
            // Fetch less in collection list, and more every time in expanded collection.
            // Also expand size if for id chunk, since there might be more assets than chunk size
            const size = assetsState?.assets.length || collectionId ? 20 : 4
            const indicator = (!collectionId && indicatorMapRef.current.get(id)) || createIndicator()
            dispatch({ type: 'SET_LOADING_STATUS', id, loading: true })
            const pageable = await hub.getNonFungibleAssetsByCollectionAndOwner(realId, address, {
                indicator,
                size,
                chainId,
            })

            if (process.env.NODE_ENV === 'development' && collectionId) {
                console.assert(
                    !pageable.nextIndicator,
                    'Loading part of a merged collection, but see pageable result has nextIndicator',
                )
            }
            if (pageable.nextIndicator) {
                indicatorMapRef.current.set(id, pageable.nextIndicator as PageIndicator)
            }
            dispatch({ type: 'APPEND_ASSETS', id, assets: pageable.data })
            // If collectionId is set, that means we are loading part of a merged collection.
            // And we will let the merged collection's iterator decide if it has ended
            const finished = !collectionId && !pageable.nextIndicator
            dispatch({ type: 'SET_LOADING_STATUS', id, finished, loading: false })
        },
        [hub, address],
    )

    const loadAssets = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll) => {
            if (!collection.id) return

            const { id } = collection
            const assetsState = assetsMapRef.current[id]
            if (assetsState?.finished || assetsState?.loading) return
            const allIds = id.split(',')

            if (allIds.length <= CHUNK_SIZE) return loadAssetsViaHub(collection)

            async function* generate(collection: Web3Helper.NonFungibleCollectionAll) {
                const chunks = [take(allIds, 4), ...chunk(allIds.slice(4), CHUNK_SIZE)].map((x) => x.join(','))
                for (const idChunk of chunks) {
                    // TODO We assume that each individual collection in merged-collection has at most 2 assets
                    await loadAssetsViaHub(collection, idChunk)
                    yield
                }
            }
            const iterator = assetsLoaderIterators.current.get(id) || generate(collection)
            assetsLoaderIterators.current.set(id, iterator)
            const result = await iterator.next()
            if (result.done) dispatch({ type: 'SET_LOADING_STATUS', id, finished: true, loading: false })
        },
        [hub, address, loadAssetsViaHub],
    )

    const loadVerifiedBy = useCallback(
        async (id: string) => {
            const verifiedState = verifiedMapRef.current[id]
            if (!hub?.getNonFungibleCollectionVerifiedBy || verifiedState || !id) return
            const verifiedBy = await hub.getNonFungibleCollectionVerifiedBy(id.split(',')[0])
            dispatch({ type: 'SET_VERIFIED', id, verifiedBy })
        },
        [hub?.getNonFungibleCollectionVerifiedBy],
    )

    const getAssets = useCallback((id: string) => listingAssetsMap[id] ?? createAssetsState(), [listingAssetsMap])
    const getVerifiedBy = useCallback((id: string) => verifiedMap[id] ?? EMPTY_LIST, [verifiedMap])
    const contextValue = useMemo((): AssetsContextOptions => {
        return {
            isHiddenAddress,
            isAllHidden,
            getAssets,
            getVerifiedBy,
            loadAssets,
            loadVerifiedBy,
            assetsMapRef,
        }
    }, [isHiddenAddress, getAssets, getVerifiedBy, loadAssets, loadVerifiedBy, isAllHidden])
    return <AssetsContext.Provider value={contextValue}>{children}</AssetsContext.Provider>
})

export function useUserAssets() {
    return useContext(AssetsContext)
}

UserAssetsProvider.displayName = 'UserAssetsProvider'
