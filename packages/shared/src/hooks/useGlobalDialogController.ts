import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { useCallback } from 'react'

export const useGlobalDialogController = () => {
    const { open, setDialog, closeDialog } = useRemoteControlledDialog(CrossIsolationMessages.events.openGlobalDialog)

    const openGlobalDialog = useCallback(
        <T>(
            to: string,
            options?: {
                replace?: boolean
                state?: T
            },
        ) => {
            setDialog({
                open: true,
                to,
                options,
            })
        },
        [setDialog],
    )

    const closeGlobalDialog = useCallback(() => {
        closeDialog()
    }, [])
    return {
        open,
        openGlobalDialog,
        closeGlobalDialog,
    }
}
