import type { ChainId } from '@masknet/web3-shared-evm'
import { useCallback, useEffect, useRef, useState } from 'react'
import { RedPacketRPC } from '../../messages'
import type { NftRedPacketHistory } from '../../types'

export function useNftRedPacketHistory(address: string, chainId: ChainId) {
    const [allHistories, setAllHistories] = useState<NftRedPacketHistory[]>([])
    const pageRef = useRef(1)
    const [loading, setLoading] = useState(false)

    const getHistories = useCallback(async () => {
        const histories = await RedPacketRPC.getNftRedPacketHistory(address, chainId, pageRef.current)
        setLoading(false)
        if (histories.length) {
            pageRef.current += 1
        }
        setAllHistories((oldList) => [...oldList, ...histories])
    }, [address, chainId])

    useEffect(() => {
        setLoading(true)
        pageRef.current = 1
        setAllHistories([])
        getHistories()
    }, [address, chainId])

    return { histories: allHistories, fetchMore: getHistories, loading }
}
