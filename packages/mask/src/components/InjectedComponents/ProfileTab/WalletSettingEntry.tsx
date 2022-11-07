import { Icons } from '@masknet/icons'
import { PluginID, CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, Stack, Typography } from '@mui/material'
import { memo, useCallback } from 'react'
import { useI18N } from '../../../utils/index.js'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '20px',
        width: 'fit-content !important',
    },
}))

export const WalletSettingEntry = memo(() => {
    const { t } = useI18N()
    const { classes } = useStyles()

    const handleOpenSettingDialog = useCallback(
        () =>
            CrossIsolationMessages.events.settingsDialogEvent.sendToLocal({
                open: true,
                targetTab: PluginID.Web3Profile,
            }),
        [],
    )

    return (
        <>
            <Stack flex={1}>
                <Typography fontWeight={400} fontSize={14}>
                    {t('show_wallet_setting_intro')}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button className={classes.button} onClick={handleOpenSettingDialog}>
                    <Icons.Settings size={18} />
                    {t('show_wallet_setting_button')}
                </Button>
            </Stack>
        </>
    )
})
