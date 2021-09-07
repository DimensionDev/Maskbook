import { useAsyncRetry } from 'react-use'
import { useOpenseaAPIConstants } from '../constants'
import { getERC721TokenDetailedOwnerListFromOpensea } from './useERC721TokenDetailedOwnerList'
import type { ERC721TokenDetailed } from '../types'
import { useRef } from 'react'
import { useChainId } from '../index'

export function useERC721TokenDetailedOwnerAllList(owner: string, offset: number) {
    const { GET_ASSETS_URL } = useOpenseaAPIConstants()
    const allListRef = useRef<ERC721TokenDetailed[]>([])
    const chainId = useChainId()
    const asyncRetry = useAsyncRetry(async () => {
        if (!owner || !GET_ASSETS_URL) return

        const list = await getERC721TokenDetailedOwnerListFromOpensea(undefined, owner, GET_ASSETS_URL, offset, chainId)

        allListRef.current = allListRef.current.concat(list)

        return { tokenDetailedOwnerList: allListRef.current, loadMore: list.length > 0 }
    }, [GET_ASSETS_URL, owner, offset, chainId])

    const clearTokenDetailedOwnerAllList = () => (allListRef.current = [])
    return { asyncRetry, clearTokenDetailedOwnerAllList }
}
