import { PluginCyberConnectRPC } from '../messages.js'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { pageableToIterator } from '@masknet/web3-shared-base'
import type { IFollowIdentity } from '../Worker/apis/index.js'
import { EMPTY_LIST } from '@masknet/shared-base'
import { useUpdateEffect } from 'react-use'
import type { ProfileTab } from '../constants.js'

export function useFollowers(tab: ProfileTab, address?: string, size = 50) {
    const [done, setDone] = useState(false)
    const [loading, toggleLoading] = useState(false)
    const [error, setError] = useState<string>()
    const [followers, setFollowers] = useState<IFollowIdentity[]>(EMPTY_LIST)
    const iterator = useMemo(() => {
        if (!address) return
        setDone(false)
        setFollowers(EMPTY_LIST)
        return pageableToIterator(async (indicator) => {
            return PluginCyberConnectRPC.fetchFollowers(tab, address, indicator)
        })
    }, [address, tab])

    const next = useCallback(async () => {
        if (!iterator || done) return
        const batchFollowers: IFollowIdentity[] = []
        toggleLoading(true)
        try {
            for (const v of Array.from({ length: size })) {
                const { value, done: iteratorDone } = await iterator.next()
                if (value instanceof Error) {
                    setError(value.message)
                    break
                }
                if (iteratorDone) {
                    setDone(true)
                    break
                }
                if (value) {
                    batchFollowers.push(value)
                }
            }
        } catch (error_) {
            setError(error_ as string)
            setDone(true)
        }

        setFollowers((pred) => [...pred, ...batchFollowers])
        toggleLoading(false)
    }, [iterator, done])

    useEffect(() => {
        if (next) next()
    }, [next])

    const retry = useCallback(() => {
        setError(undefined)
        setFollowers(EMPTY_LIST)
        setDone(false)
    }, [])

    useUpdateEffect(() => setFollowers([]), [address])
    return {
        value: followers,
        next,
        done,
        loading,
        error,
        retry,
    }
}
