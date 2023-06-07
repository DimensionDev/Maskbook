import { chunk, take } from 'lodash-es'
import {
    createContext,
    memo,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useReducer,
    useRef,
    type FC,
    type PropsWithChildren,
    type MutableRefObject,
} from 'react'
import { createIndicator, EMPTY_LIST, type NetworkPluginID, type PageIndicator } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Hub } from '@masknet/web3-hooks-base'
import {
    assetsReducer,
    createAssetsState,
    initialAssetsState,
    type AssetsReducerState,
    type AssetsState,
} from './assetsReducer.js'

interface AssetsContextOptions {
    assetsMapRef: MutableRefObject<Record<string, AssetsState>>
    getAssets(collection: Web3Helper.NonFungibleCollectionAll): AssetsState
    /** Get verified-by marketplaces */
    getVerifiedBy(id: string): string[]
    loadAssets(collection: Web3Helper.NonFungibleCollectionAll): Promise<void>
    loadVerifiedBy(id: string): Promise<void>
}

export const AssetsContext = createContext<AssetsContextOptions>({
    assetsMapRef: { current: {} },
    getAssets: () => ({ loading: false, finished: false, assets: [] }),
    getVerifiedBy: () => EMPTY_LIST,
    loadAssets: () => Promise.resolve(),
    loadVerifiedBy: () => Promise.resolve(),
})

interface Props {
    pluginID: NetworkPluginID
    address: string
}

/** Min merged collection chunk size */
const CHUNK_SIZE = 8

export const UserAssetsProvider: FC<PropsWithChildren<Props>> = memo(({ pluginID, address, children }) => {
    const [{ assetsMap, verifiedMap }, dispatch] = useReducer(assetsReducer, initialAssetsState)
    const indicatorMapRef = useRef<Map<string, PageIndicator | undefined>>(new Map())
    const assetsMapRef = useRef<AssetsReducerState['assetsMap']>({})
    const verifiedMapRef = useRef<AssetsReducerState['verifiedMap']>({})
    useEffect(() => {
        assetsMapRef.current = assetsMap
        verifiedMapRef.current = verifiedMap
    })

    const Hub = useWeb3Hub(pluginID)

    // We load merged collections with iterators
    const assetsLoaderIterators = useRef<Map<string, AsyncGenerator<undefined, void>>>(new Map())
    const loadAssetsViaHub = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll, collectionId?: string) => {
            if (!collection.id) return

            const { id, chainId } = collection
            const stateKey = `${id}.${chainId}`
            const realId = collectionId ?? id
            const assetsState = assetsMapRef.current[id]

            // Fetch less in collection list, and more every time in expanded collection.
            // Also expand size if for id chunk, since there might be more assets than chunk size
            const size = assetsState?.assets.length || collectionId ? 20 : 4
            const indicator = (!collectionId && indicatorMapRef.current.get(id)) || createIndicator()
            dispatch({ type: 'SET_LOADING_STATUS', id: stateKey, loading: true })
            const pageable = await Hub.getNonFungibleAssetsByCollectionAndOwner(realId, address, {
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
            dispatch({ type: 'APPEND_ASSETS', id: stateKey, assets: pageable.data })
            // If collectionId is set, that means we are loading part of a merged collection.
            // And we will let the merged collection's iterator decide if it has ended
            const finished = !collectionId && !pageable.nextIndicator
            dispatch({ type: 'SET_LOADING_STATUS', id: stateKey, finished, loading: false })
        },
        [Hub, address],
    )

    const loadAssets = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll) => {
            if (!collection.id) return

            const { id, chainId } = collection
            const stateKey = `${id}.${chainId}`
            const assetsState = assetsMapRef.current[stateKey]
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
            const iterator = assetsLoaderIterators.current.get(stateKey) || generate(collection)
            assetsLoaderIterators.current.set(stateKey, iterator)
            const result = await iterator.next()
            if (result.done) dispatch({ type: 'SET_LOADING_STATUS', id: stateKey, finished: true, loading: false })
        },
        [Hub, address, loadAssetsViaHub],
    )

    const loadVerifiedBy = useCallback(
        async (id: string) => {
            const verifiedState = verifiedMapRef.current[id]
            if (!Hub?.getNonFungibleCollectionVerifiedBy || verifiedState || !id) return
            const verifiedBy = await Hub.getNonFungibleCollectionVerifiedBy(id.split(',')[0])
            dispatch({ type: 'SET_VERIFIED', id, verifiedBy })
        },
        [Hub?.getNonFungibleCollectionVerifiedBy],
    )

    const getAssets = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            const key = `${collection.id}.${collection.chainId}`
            return assetsMap[key] ?? createAssetsState()
        },
        [assetsMap],
    )
    const getVerifiedBy = useCallback((id: string) => verifiedMap[id] ?? EMPTY_LIST, [verifiedMap])
    const contextValue = useMemo((): AssetsContextOptions => {
        return {
            getAssets,
            getVerifiedBy,
            loadAssets,
            loadVerifiedBy,
            assetsMapRef,
        }
    }, [getAssets, getVerifiedBy, loadAssets, loadVerifiedBy])
    return <AssetsContext.Provider value={contextValue}>{children}</AssetsContext.Provider>
})

export function useUserAssets() {
    return useContext(AssetsContext)
}

UserAssetsProvider.displayName = 'UserAssetsProvider'
