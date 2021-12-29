import { useAsyncRetry } from 'react-use'
import type BigNumber from 'bignumber.js'
import type { ProfileIdentifier } from '@masknet/shared-base'

export interface DAO_Payload {
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

export function useDao(identifier: ProfileIdentifier) {
    return useAsyncRetry(async () => {
        if (identifier.isUnknown) return
        try {
            const response = await fetch(
                `https://dimensiondev.github.io/Maskbook-Configuration/com.maskbook.dao-${identifier.userId.toLowerCase()}.json`,
            )
            if (!response.ok) return
            return (await response.json()) as DAO_Payload
        } catch {
            return
        }
    }, [identifier.toText()])
}
