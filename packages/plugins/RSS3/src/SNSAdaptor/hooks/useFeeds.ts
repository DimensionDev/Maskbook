import { useCallback, useEffect, useRef, useState } from 'react'
import { uniqBy } from 'lodash-es'
import { RSS3 } from '@masknet/web3-providers'
import type { PageIndicator } from '@masknet/shared-base'
import type { RSS3BaseAPI } from '@masknet/web3-providers/types'

export function useFeeds(address?: string, tag?: RSS3BaseAPI.Tag) {
    const indicatorRef = useRef<PageIndicator>()
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
        load()
    }, [load])

    return { feeds, loading, finished, load, next: load }
}
