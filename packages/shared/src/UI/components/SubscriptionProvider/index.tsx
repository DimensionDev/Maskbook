import { CrossIsolationMessages } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'
import { useEffect } from 'react'

export function SubscriptionProvider({ children }: React.PropsWithChildren<{}>) {
    const { Wallet, Connection, Provider } = useWeb3State()
    useEffect(
        () =>
            CrossIsolationMessages.events.ownerDeletionEvent.on(({ owner }) => {
                const account = Provider?.account?.getCurrentValue()
                const targets = Wallet?.wallets?.getCurrentValue().filter((x) => isSameAddress(x.owner, owner))
                if (targets?.some((x) => isSameAddress(x.address, account))) Connection?.getConnection?.().disconnect()
            }),
        [Wallet, Connection, Provider],
    )
    return <>{children}</>
}
