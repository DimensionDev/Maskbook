import { EMPTY_LIST } from '@masknet/shared-base'
import { Providers } from '@masknet/web3-providers'
import { ProviderType } from '@masknet/web3-shared-evm'
import { useMemo } from 'react'
import { usePersistSubscription } from '@masknet/shared-base-ui'

export function useWallets() {
    // We got stored Mask wallets only.
    const wallets = usePersistSubscription(
        '@@mask-wallets',
        Providers[ProviderType.MaskWallet].subscription.wallets ?? EMPTY_LIST,
    )

    return useMemo(() => {
        return [...wallets].sort((a, b) => {
            if (a.owner && !b.owner) return 1
            // Could be serialized by react query persist client
            const timestampA = new Date(a.createdAt).getTime()
            const timestampB = new Date(b.createdAt).getTime()
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
