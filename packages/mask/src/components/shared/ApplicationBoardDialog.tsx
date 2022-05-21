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
import { Icon } from '@masknet/icons'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(1.5, 2, '6px'),
            height: 470,
            overflow: 'hidden',
        },
        settingIcon: {
            height: 24,
            width: 24,
            fill: theme.palette.text.primary,
            cursor: 'pointer',
        },
    }
})

export function ApplicationBoardDialog() {
    const { classes } = useStyles()
    const { t } = useI18N()
    const [openSettings, setOpenSettings] = useState(false)

    const { open, closeDialog: closeAppDialog } = useRemoteControlledDialog(
        WalletMessages.events.ApplicationDialogUpdated,
    )

    const closeDialog = useCallback(() => {
        closeAppDialog()
        CrossIsolationMessages.events.requestComposition.sendToLocal({
            reason: 'timeline',
            open: false,
        })
    }, [closeAppDialog])

    return open ? (
        <InjectedDialog
            open={open}
            maxWidth="sm"
            onClose={closeDialog}
            title={t('applications')}
            titleTail={<Icon type="gear" className={classes.settingIcon} onClick={() => setOpenSettings(true)} />}>
            <DialogContent className={classes.content}>
                <ApplicationBoard closeDialog={closeDialog} />
                {openSettings ? (
                    <ApplicationSettingDialog open={openSettings} onClose={() => setOpenSettings(false)} />
                ) : null}
            </DialogContent>
        </InjectedDialog>
    ) : null
}
