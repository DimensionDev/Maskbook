import { EMPTY_LIST, type Wallet } from '@masknet/shared-base'
import { MaskWalletProvider } from '@masknet/web3-providers'
import { useMemo } from 'react'
import { usePersistSubscription } from '@masknet/shared-base-ui'

export function useWallets() {
    // We got stored Mask wallets only.
    const wallets = usePersistSubscription('@@mask-wallets', MaskWalletProvider.subscription.wallets ?? EMPTY_LIST)

    return useMemo(() => {
        return [...wallets]
            .map((w) => {
                // Could be serialized by react query persist client
                if (w.createdAt instanceof Date && w.updatedAt instanceof Date) return w
                return {
                    ...w,
                    createdAt: new Date(w.createdAt),
                    updatedAt: new Date(w.updatedAt),
                } as Wallet
            })
            .sort((a, b) => {
                if (a.owner && !b.owner) return 1
                const timestampA = a.createdAt.getTime()
                const timestampB = b.createdAt.getTime()
                if (timestampA - timestampB > 10000) {
                    return 1
                } else if (timestampB - timestampA > 10000) {
                    return -1
                }
                const numA = a.name.split('Wallet ')[1]
                const numB = b.name.split('Wallet ')[1]
                try {
                    if (!numA && numB && !Number.isNaN(numB)) return 1
                    if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
                        return Number(numA) > Number(numB) ? 1 : -1
                    } else {
                        return numB.length - numA.length
                    }
                } catch {
                    return 0
                }
            })
    }, [wallets])
}
