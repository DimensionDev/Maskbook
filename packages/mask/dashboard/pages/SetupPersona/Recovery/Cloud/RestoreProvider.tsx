import { useCallback, useReducer } from 'react'
import { createContainer } from '@masknet/shared-base-ui'
import type { BackupAccountType } from '@masknet/shared-base'
import { initialState, restoreReducer } from './restoreReducer.js'
import { fetchDownloadLink } from '../../../../utils/api.js'

function useRestoreState() {
    const [state, dispatch] = useReducer(restoreReducer, initialState)
    const downloadBackupInfo = useCallback((type: BackupAccountType, account: string, code: string) => {
        return fetchDownloadLink({ type, account, code })
    }, [])

    return { state, dispatch, downloadBackupInfo }
}

export const RestoreContext = createContainer(useRestoreState)
RestoreContext.Provider.displayName = 'RestoreContextProvider'
