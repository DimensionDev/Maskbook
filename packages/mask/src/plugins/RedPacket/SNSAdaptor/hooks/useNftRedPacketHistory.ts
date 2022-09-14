import { EMPTY_LIST } from '@masknet/shared-base'
import type { ChainId } from '@masknet/web3-shared-evm'
import { eq, uniqBy } from 'lodash-unified'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RedPacketRPC } from '../../messages.js'
import type { NftRedPacketHistory } from '../../types.js'

const PAGE_SIZE = 5
export function useNftRedPacketHistory(creatorAddress: string, chainId: ChainId) {
    const pageRef = useRef<Record<string, number>>({})
    const [loading, setLoading] = useState(false)
    const [historyDb, setHistoryDb] = useState<Record<string, NftRedPacketHistory[]>>({})

    const dbKey = `${creatorAddress}_${chainId}`
    const getHistories = useCallback(async () => {
        setLoading(true)
        const histories = await RedPacketRPC.getNftRedPacketHistory(
            creatorAddress,
            chainId,
            pageRef.current[dbKey] ?? 1,
            PAGE_SIZE,
        )
        setLoading(false)
        setHistoryDb((db) => {
            const oldList = db[dbKey] ?? []
            const list = uniqBy([...oldList, ...histories], (x) => x.rpid)
            if (eq(oldList, list)) return db
            pageRef.current[dbKey] = Math.ceil(list.length / PAGE_SIZE) + 1
            return {
                ...db,
                [dbKey]: list,
            }
        })
    }, [creatorAddress, chainId, dbKey])

    useEffect(() => {
        getHistories()
    }, [getHistories])

    const histories = historyDb[dbKey] ?? EMPTY_LIST

    return { histories, fetchMore: getHistories, loading }
}
