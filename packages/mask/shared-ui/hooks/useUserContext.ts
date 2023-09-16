import { PersistentStorages, type BackupConfig } from '@masknet/shared-base'
import { useCallback } from 'react'
import { createContainer } from 'unstated-next'
import { useSubscription } from 'use-subscription'

function useUserContext() {
    const user = useSubscription(PersistentStorages.Settings.storage.backupConfig.subscription)

    const updateUser = useCallback(
        async (obj: Partial<BackupConfig>) => {
            await PersistentStorages.Settings.storage.backupConfig.setValue({
                ...user,
                ...obj,
                backupPassword: btoa(obj.backupPassword ?? ''),
            })
        },
        [user],
    )

    return {
        user: {
            ...user,
            backupPassword: user.backupPassword && atob(user.backupPassword),
        },
        updateUser,
    }
}

export const UserContext = createContainer(useUserContext)
