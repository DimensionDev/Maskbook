import { useEffect } from 'react'
import type { Web3Helper } from '@masknet/web3-helpers'
import { CrossIsolationMessages, NetworkPluginID } from '@masknet/shared-base'
import { useWeb3State } from '@masknet/web3-hooks-base'
import { isSameAddress } from '@masknet/web3-shared-base'

export function SubscriptionProvider({
    pluginID,
    providerType,
    children,
}: React.PropsWithChildren<{ pluginID: NetworkPluginID; providerType: Web3Helper.ProviderTypeAll }>) {
    const { Connection, Provider } = useWeb3State(pluginID)

    useEffect(
        () =>
            CrossIsolationMessages.events.ownerDeletionEvent.on(async ({ owner }) => {
                const connection = Connection?.getConnection?.()
                const account = Provider?.account?.getCurrentValue()
                const targets = Provider?.getWalletProvider(providerType)
                    ?.subscription?.wallets?.getCurrentValue()
                    .filter((x) => isSameAddress(x.owner, owner))
                if (targets?.length) await connection?.removeWallets?.(targets)
                if (targets?.some((x) => isSameAddress(x.address, account))) await connection?.disconnect()
            }),
        [Connection, Provider],
    )
    return <>{children}</>
}
