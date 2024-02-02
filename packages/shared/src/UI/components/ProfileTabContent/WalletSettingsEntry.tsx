import { Icons } from '@masknet/icons'
import { CrossIsolationMessages } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Button, Stack, Typography } from '@mui/material'
import { memo } from 'react'
import { useSharedTrans } from '../../../../locales/index.js'

const useStyles = makeStyles()((theme) => ({
    button: {
        display: 'inline-flex',
        gap: theme.spacing(1),
        minWidth: 254,
        borderRadius: '20px',
        width: 'fit-content !important',
    },
}))

function openWeb3ProfileSettingDialog() {
    CrossIsolationMessages.events.web3ProfileDialogEvent.sendToLocal({
        open: true,
    })
}
export const WalletSettingsEntry = memo(function WalletSettingsEntry() {
    const t = useSharedTrans()
    const { classes, theme } = useStyles()

    return (
        <>
            <Stack flex={1}>
                <Typography fontWeight={400} fontSize={14} color={theme.palette.maskColor.second}>
                    {t.show_wallet_setting_intro()}
                </Typography>
            </Stack>
            <Stack direction="row" justifyContent="center">
                <Button className={classes.button} onClick={openWeb3ProfileSettingDialog}>
                    <Icons.Settings size={18} />
                    {t.show_wallet_setting_button()}
                </Button>
            </Stack>
        </>
    )
})
