import { NextIDStorage } from '@masknet/web3-providers'
import { useAsyncRetry } from 'react-use'
import type { KVType } from '../types'

export const useKV = (publicHexKey?: string) => {
    return useAsyncRetry(async () => {
        if (!publicHexKey) return
        const res = await NextIDStorage.get<KVType>(publicHexKey)
        if (!res.ok) return
        return res?.val
    }, [publicHexKey])
}
