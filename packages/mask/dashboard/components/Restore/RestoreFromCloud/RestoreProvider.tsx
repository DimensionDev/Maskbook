import { useCallback, useReducer } from 'react'
import { createContainer } from 'unstated-next'
import { fetchDownloadLink } from '../../../utils/api.js'
import { type AccountType } from '../../../type.js'
import { initialState, restoreReducer } from './restoreReducer.js'

function useRestoreState() {
    const [state, dispatch] = useReducer(restoreReducer, initialState)
    const downloadBackupInfo = useCallback((type: AccountType, account: string, code: string) => {
        return fetchDownloadLink({ type, account, code })
    }, [])

    return { state, dispatch, downloadBackupInfo }
}

export const RestoreContext = createContainer(useRestoreState)
RestoreContext.Provider.displayName = 'RestoreContextProvider'
