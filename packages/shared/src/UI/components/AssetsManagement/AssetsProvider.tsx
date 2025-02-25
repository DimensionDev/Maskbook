import { chunk, noop, sum, take } from 'lodash-es'
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
    useState,
    type JSX,
} from 'react'
import { createIndicator, EMPTY_LIST, EMPTY_OBJECT, type PageIndicator } from '@masknet/shared-base'
import type { Web3Helper } from '@masknet/web3-helpers'
import { useWeb3Hub } from '@masknet/web3-hooks-base'
import {
    assetsReducer,
    createAssetsState,
    initialAssetsState,
    type AssetsReducerState,
    type AssetsState,
} from './assetsReducer.js'
import { useChainRuntime } from './ChainRuntimeProvider.js'
import { CollectionsContext } from './CollectionsProvider.js'

const MAX_SELECTION = 255
interface AssetsContextOptions {
    assetsMapRef: MutableRefObject<Record<string, AssetsState>>
    getAssets(collection: Web3Helper.NonFungibleCollectionAll): AssetsState
    getBLockedTokenIds(collection: Web3Helper.NonFungibleCollectionAll): string[]
    /** Get verified-by marketplaces */
    getVerifiedBy(id: string): string[]
    loadAssets(collection: Web3Helper.NonFungibleCollectionAll): Promise<void>
    loadVerifiedBy(id: string): Promise<void>
    // select mode
    selectMode?: boolean
    multiple?: boolean
    selectedAsset?: Web3Helper.NonFungibleAssetAll
    selectedAssets?: Web3Helper.NonFungibleAssetAll[]
    /**
     * For example, NFT redpacket allows 255 at most.
     * Since only NFT redpacket has such limit, we set it as default
     */
    maxSelection?: number
    /** Would be shown as tooltip */
    maxSelectionDescription?: string | JSX.Element
    searchKeyword: string
    setSearchKeyword(keyword: string): void

    /** All collectibles get hidden */
    isAllHidden: boolean
    isEmpty: boolean
}

const AssetsContext = createContext<AssetsContextOptions>({
    assetsMapRef: { current: {} },
    getAssets: () => ({ loading: false, finished: false, assets: [] }),
    getBLockedTokenIds: () => EMPTY_LIST,
    getVerifiedBy: () => EMPTY_LIST,
    loadAssets: () => Promise.resolve(),
    loadVerifiedBy: () => Promise.resolve(),
    // select mode
    selectMode: false,
    multiple: false,
    selectedAsset: undefined,
    selectedAssets: [],
    maxSelection: MAX_SELECTION,
    searchKeyword: '',
    setSearchKeyword: noop,

    isAllHidden: false,
    isEmpty: false,
})

/** Min merged collection chunk size */
const CHUNK_SIZE = 8

type LoaderIteratorMap = Map<string, AsyncGenerator<Web3Helper.NonFungibleAssetAll[] | undefined, void>>
const getAssetsTotal = (map: Record<string, AssetsState>) => sum(Object.values(map).map((x) => x.assets.length))

export interface AssetsProviderProps
    extends PropsWithChildren,
        Pick<
            AssetsContextOptions,
            'selectMode' | 'multiple' | 'selectedAsset' | 'selectedAssets' | 'maxSelection' | 'maxSelectionDescription'
        > {
    /** blocked ids in format of `${chainid}.${address}.${tokenId}` */
    blockedIds?: string[]
}
export const AssetsProvider = memo<AssetsProviderProps>(function AssetsProvider({
    children,
    blockedIds = EMPTY_LIST,
    selectMode,
    multiple,
    maxSelection = MAX_SELECTION,
    maxSelectionDescription,
    selectedAsset,
    selectedAssets,
}) {
    const [{ assetsMap, verifiedMap }, dispatch] = useReducer(assetsReducer, initialAssetsState)
    const indicatorMapRef = useRef<Map<string, PageIndicator | undefined>>(new Map())
    const { pluginID, account } = useChainRuntime()

    const blockedTokenIdsMap = useMemo(() => {
        if (!blockedIds.length) return EMPTY_OBJECT
        return blockedIds.reduce((map: Record<string, string[]>, id) => {
            const [chainId, address, tokenId] = id.split('.')
            const collectionKey = [chainId, address].join('.')
            const list = map[collectionKey] ?? []
            list.push(tokenId)
            map[collectionKey] = list
            return map
        }, {})
    }, [blockedIds])
    // A mapping that contains listing assets only
    const listingAssetsMap = useMemo(() => {
        if (!blockedIds.length) return assetsMap
        const listingMap: Record<string, AssetsState> = { ...assetsMap }
        let updated = false
        for (const storeId in assetsMap) {
            const originalAssets = assetsMap[storeId].assets
            const newAssets = originalAssets.filter((x) => {
                const assetId = `${x.chainId}.${x.address}.${x.tokenId}`.toLowerCase()
                return !blockedIds.includes(assetId)
            })
            if (newAssets.length !== originalAssets.length) {
                listingMap[storeId] = { ...listingMap[storeId], assets: newAssets }
                updated = true
            }
        }
        // Update accordingly
        return updated ? listingMap : assetsMap
    }, [assetsMap, blockedIds])

    const assetsMapRef = useRef<AssetsReducerState['assetsMap']>({})
    const listingAssetsMapRef = useRef<AssetsReducerState['assetsMap']>({})
    const verifiedMapRef = useRef<AssetsReducerState['verifiedMap']>({})
    const blockedTokenIdsMapRef = useRef<Record<string, string[]>>({})
    useEffect(() => {
        assetsMapRef.current = assetsMap
        verifiedMapRef.current = verifiedMap
        listingAssetsMapRef.current = listingAssetsMap
        blockedTokenIdsMapRef.current = blockedTokenIdsMap
    })

    const { collections } = CollectionsContext.useContainer()
    const isEmpty = useMemo(() => {
        // Collections assets are lazy loading, can't judge if not all collections been load
        if (Object.keys(assetsMap).length < collections.length || Object.values(assetsMap).some((x) => x.loading))
            return false
        // Spam score of some collections might be OK, but NFTs of them might be treated as spam #MF-5091
        return getAssetsTotal(assetsMap) === 0
    }, [assetsMap, collections.length])
    const isAllHidden = useMemo(() => {
        // Collections assets are lazy loading, can't judge if not all collections been load
        if (Object.keys(assetsMap).length < collections.length) return false
        if (!blockedIds.length || getAssetsTotal(assetsMap) === 0) return false
        return getAssetsTotal(listingAssetsMap) === 0
    }, [assetsMap, listingAssetsMap, !blockedIds.length, collections.length])

    const Hub = useWeb3Hub(pluginID)

    // We load merged collections with iterators
    const assetsLoaderIterators = useRef<LoaderIteratorMap>(new Map())
    const loadAssetsViaHub = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll, collectionId?: string) => {
            if (!collection.id) return

            const { id, chainId } = collection
            const stateKey = `${id}.${chainId}`
            const storeId = `${account}.${stateKey}`
            const realId = collectionId ?? id
            const assetsState = assetsMapRef.current[storeId]

            // Fetch less in collection list, and more every time in expanded collection.
            // Also expand size if for id chunk, since there might be more assets than chunk size
            const size = assetsState?.assets.length || collectionId ? 20 : 4
            const indicator = (!collectionId && indicatorMapRef.current.get(storeId)) || createIndicator()
            dispatch({ type: 'SET_LOADING_STATUS', account, id: stateKey, loading: true })
            const pageable = await Hub.getNonFungibleAssetsByCollectionAndOwner(realId, account, {
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
                indicatorMapRef.current.set(storeId, pageable.nextIndicator as PageIndicator)
            }
            dispatch({ type: 'APPEND_ASSETS', id: stateKey, account, assets: pageable.data })
            // If collectionId is set, that means we are loading part of a merged collection.
            // And we will let the merged collection's iterator decide if it has ended
            const finished = !collectionId && !pageable.nextIndicator
            dispatch({ type: 'SET_LOADING_STATUS', id: stateKey, account, finished, loading: false })
            return pageable.data
        },
        [Hub, account],
    )

    const loadAssets = useCallback(
        async (collection: Web3Helper.NonFungibleCollectionAll) => {
            if (!collection.id) return

            const { id, chainId } = collection
            const stateKey = `${id}.${chainId}`
            const storeId = `${account}.${stateKey}`
            const assetsState = assetsMapRef.current[storeId]
            if (assetsState?.finished || assetsState?.loading) return
            const allIds = id.split(',')

            let assets: Web3Helper.NonFungibleAssetAll[] | undefined | void
            if (allIds.length <= CHUNK_SIZE) {
                assets = await loadAssetsViaHub(collection)
            } else {
                async function* generate(collection: Web3Helper.NonFungibleCollectionAll) {
                    const chunks = [take(allIds, 4), ...chunk(allIds.slice(4), CHUNK_SIZE)].map((x) => x.join(','))
                    for (const idChunk of chunks) {
                        // TODO We assume that each individual collection in merged-collection has at most 2 assets
                        yield await loadAssetsViaHub(collection, idChunk)
                    }
                }
                const iterator = assetsLoaderIterators.current.get(stateKey) || generate(collection)
                assetsLoaderIterators.current.set(stateKey, iterator)
                const result = await iterator.next()
                if (result.done) {
                    dispatch({ type: 'SET_LOADING_STATUS', id: stateKey, account, finished: true, loading: false })
                    return
                }
                assets = result.value
            }

            // If assets just fetched are all blocked, load another page.
            const blockedMapKey = [collection.chainId, collection.address].join('.').toLowerCase()
            const blockedList = blockedTokenIdsMapRef.current[blockedMapKey]
            if (!blockedList?.length || !assets?.length) return
            const listings = assets.filter((x) => !blockedList.includes(x.tokenId))
            if (!listings.length) await loadAssetsViaHub(collection)
        },
        [loadAssetsViaHub, account],
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
            const key = `${account}.${collection.id}.${collection.chainId}`
            return listingAssetsMap[key] ?? createAssetsState()
        },
        [listingAssetsMap, account],
    )
    const getBLockedTokenIds = useCallback(
        (collection: Web3Helper.NonFungibleCollectionAll) => {
            if (!blockedIds.length) return EMPTY_LIST
            const key = `${collection.chainId}.${collection.address}`.toLowerCase()
            return blockedTokenIdsMap[key] ?? EMPTY_LIST
        },
        [blockedTokenIdsMap, blockedIds],
    )
    const getVerifiedBy = useCallback((id: string) => verifiedMap[id] ?? EMPTY_LIST, [verifiedMap])

    // Search mode
    const [searchKeyword, setSearchKeyword] = useState('')

    const contextValue = useMemo((): AssetsContextOptions => {
        return {
            isAllHidden,
            isEmpty,
            getAssets,
            getBLockedTokenIds,
            getVerifiedBy,
            loadAssets,
            loadVerifiedBy,
            assetsMapRef: listingAssetsMapRef,
            // select mode
            selectMode,
            multiple,
            selectedAssets,
            selectedAsset,
            maxSelection,
            maxSelectionDescription,
            searchKeyword,
            setSearchKeyword,
        }
    }, [
        getAssets,
        getBLockedTokenIds,
        getVerifiedBy,
        loadAssets,
        loadVerifiedBy,
        isAllHidden,
        isEmpty,
        selectMode,
        searchKeyword,
        multiple,
        maxSelection,
        maxSelectionDescription,
        selectedAssets,
        selectedAsset,
    ])

    return <AssetsContext value={contextValue}>{children}</AssetsContext>
})

export function useUserAssets() {
    return useContext(AssetsContext)
}
