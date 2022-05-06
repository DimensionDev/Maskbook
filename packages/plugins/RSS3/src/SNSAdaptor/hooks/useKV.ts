import { NextIDStorage } from '@masknet/web3-providers'
import type { kvType } from '../../types'

export const getKV = async (publicHexKey: string) => {
    try {
        const kv = await NextIDStorage.get<kvType>(publicHexKey)
        return kv?.val
    } catch (error) {
        console.error(error)
        return null
    }
}
