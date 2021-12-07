import { useAsyncRetry } from 'react-use'
import type BigNumber from 'bignumber.js'

export type Dao_Payload = {
    // timestamp
    createdAt: string
    creator: string
    currentBalance: BigNumber.Value
    description: string
    discord: string
    handle: string
    id: string
    infoUri: string
    logoUri: string
    name: string
    payButton: string
    payDisclosure: string
    tokens: []
    totalPaid: BigNumber.Value
    totalRedeemed: BigNumber.Value
    twitter: string
    uri: string
    version: number
}
export function useDao(userId: string) {
    const api = `https://dimensiondev.github.io/Maskbook-Configuration/com.maskbook.dao-${userId.toLowerCase()}.json`
    return useAsyncRetry(async () => {
        if (!userId || userId.toLowerCase() === 'unknown') return
        try {
            const res = await fetch(api)
            if (!res.ok) {
                return
            }
            const r = await res.json()
            return r as Dao_Payload
        } catch {
            return
        }
    }, [api, userId])
}
