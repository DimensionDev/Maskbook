import { EMPTY_LIST } from '@masknet/shared-base'
import { RSS3, RSS3BaseAPI } from '@masknet/web3-providers'
import type { HubIndicator } from '@masknet/web3-shared-base'
import { uniqBy } from 'lodash-es'
import { useCallback, useEffect, useRef, useState } from 'react'

export function useFeeds(address?: string, tag?: RSS3BaseAPI.Tag) {
    const indicatorRef = useRef<HubIndicator>()
    const [feeds, setFeeds] = useState<RSS3BaseAPI.Web3Feed[]>([])
    const [finished, setFinished] = useState(false)

    const [loading, setLoading] = useState(false)
    const loadingRef = useRef(false)
    loadingRef.current = loading

    const load = useCallback(async () => {
        if (loadingRef.current || !address) {
            setFinished(true)
            return
        }
        setLoading(true)
        const { data, nextIndicator } = await RSS3.getAllNotes(
            address,
            { tag },
            {
                indicator: indicatorRef.current,
                size: 20,
            },
        )
        setLoading(false)
        indicatorRef.current = nextIndicator

        if (!data.length) {
            setFinished(true)
            return
        }
        setFeeds((oldList) => uniqBy([...oldList, ...data], (x) => x.timestamp))
    }, [address, tag])

    useEffect(() => {
        setFinished(false)
        setFeeds(EMPTY_LIST)
        load()
    }, [load])

    return { feeds, loading, finished, load, next: load }
}
