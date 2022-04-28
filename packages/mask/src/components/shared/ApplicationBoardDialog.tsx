import { DialogContent, useTheme } from '@mui/material'
import { useState, useCallback } from 'react'
import { ApplicationSettingDialog } from './ApplicationSettingDialog'
import { makeStyles } from '@masknet/theme'
import { InjectedDialog } from '@masknet/shared'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { useRemoteControlledDialog } from '@masknet/shared-base-ui'
import { ApplicationBoard } from './ApplicationBoard'
import { WalletMessages } from '../../plugins/Wallet/messages'
import { useI18N } from '../../utils'

const useStyles = makeStyles()((theme) => {
    return {
        content: {
            padding: theme.spacing(2, 2.5),
            height: 490,
            overflowX: 'hidden',
        },
        settingIcon: {
            height: 24,
            width: 24,
            cursor: 'pointer',
        },
    }
})

export function ApplicationBoardDialog() {
    const theme = useTheme()
    const { classes } = useStyles()
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

    const SettingIconDarkModeUrl = new URL('./assets/settings_dark_mode.png', import.meta.url).toString()
    const SettingIconLightModeUrl = new URL('./assets/settings_light_mode.png', import.meta.url).toString()

    return (
        <InjectedDialog
            open={open}
            maxWidth="sm"
            onClose={closeDialog}
            title={t('applications')}
            titleTail={
                <img
                    src={theme.palette.mode === 'dark' ? SettingIconDarkModeUrl : SettingIconLightModeUrl}
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
    )
}
