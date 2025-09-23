import { PersistentStorages } from '@masknet/shared-base'
import { useSyncJwtBasedAuthState } from '@privy-io/react-auth'
import { memo, useCallback } from 'react'
import { useSubscription } from 'use-subscription'

export const PrivySetup = memo(function PrivySetup() {
    const getExternalJwt = useCallback(async () => {
        const firefly_account = PersistentStorages.Settings.storage.firefly_account.value
        return firefly_account.accessToken
    }, [])

    const firefly_account = useSubscription(PersistentStorages.Settings.storage.firefly_account.subscription)

    const subscribe = useCallback((onJwtAuthStateChange: () => void) => {
        return PersistentStorages.Settings.storage.firefly_account.subscription.subscribe(() => {
            onJwtAuthStateChange()
        })
    }, [])

    useSyncJwtBasedAuthState({
        getExternalJwt,
        subscribe,
        enabled: !!firefly_account,
        onError: (error) => {
            console.log('privy error', error)
        },
    })

    return null
})
