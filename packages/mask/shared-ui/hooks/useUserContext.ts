import { PersistentStorages, type BackupConfig } from '@masknet/shared-base'
import { usePersistSubscription, createContainer } from '@masknet/shared-base-ui'
import { useCallback, useMemo } from 'react'

function useUserContext() {
    const user = usePersistSubscription(
        '@@PersistentStorages.Settings.storage.backupConfig.subscription',
        PersistentStorages.Settings.storage.backupConfig.subscription,
    )

    const updateUser = useCallback(
        async (userConfig: Partial<BackupConfig> | ((user: BackupConfig) => BackupConfig)) => {
            if (typeof userConfig === 'function') userConfig = userConfig(user)
            await PersistentStorages.Settings.storage.backupConfig.setValue({
                ...user,
                ...userConfig,
                backupPassword: userConfig.backupPassword ? btoa(userConfig.backupPassword) : user.backupPassword,
            })
        },
        [user],
    )

    const result = useMemo(() => {
        try {
            const backupPassword = user.backupPassword && atob(user.backupPassword)
            return {
                ...user,
                backupPassword,
            }
        } catch {
            // Maybe `backupPassword` is not base64-encoded.
            return user
        }
    }, [user, updateUser])

    return {
        user: result,
        updateUser,
    }
}

export const UserContext = createContainer(useUserContext)
UserContext.Provider.displayName = 'UserContext.Provider'
