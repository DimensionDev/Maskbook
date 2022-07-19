import { DialogContent } from '@mui/material'
import { useState, useCallback } from 'react'
import { ApplicationSettingDialog } from './ApplicationSettingDialog'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationBoard } from './ApplicationBoard'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'
import { GearIcon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(1.5, 2, '6px'),
            height: 470,
            overflow: 'hidden',
        },
        settingIcon: {
            cursor: 'pointer',
        },
    }
})

export function ApplicationBoardDialog() {
    const { classes, theme } = useStyles()
    const { t } = useI18N()
    const [openSettings, setOpenSettings] = useState(false)

    const { open, closeDialog: _closeDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const closeDialog = useCallback(() => {
        _closeDialog()
        CrossIsolationMessages.events.requestComposition.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [])

    return open ? (
        <InjectedDialog
            open={open}
            maxWidth="sm"
            onClose={closeDialog}
            title={t('applications')}
            titleTail={
                <GearIcon
                    size={24}
                    color={theme.palette.text.primary}
                    className={classes.settingIcon}
                    onClick={() => setOpenSettings(true)}
                />
            }>
            <DialogContent className={classes.content}>
                <ApplicationBoard closeDialog={closeDialog} />
                {openSettings ? (
                    <ApplicationSettingDialog open={openSettings} onClose={() => setOpenSettings(false)} />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    ) : null
}
