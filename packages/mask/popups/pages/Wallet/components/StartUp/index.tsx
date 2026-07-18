import Services from '#services'
import { Trans } from '@lingui/react/macro'
import { PopupRoutes, Sniffings } from '@masknet/shared-base'
import { makeStyles } from '@masknet/theme'
import { Box, Typography } from '@mui/material'
import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { ImportCreateWallet } from '../ImportCreateWallet/index.js'
import { WalletSetupHeaderUI } from '../WalletHeader/WalletSetupHeaderUI.js'
import { useMatch } from 'react-router-dom'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        background: theme.palette.maskColor.secondaryBottom,
    },
    content: {
        padding: 16,
        display: 'flex',
        justifyContent: 'flex-start',
        flexDirection: 'column',
    },
    titleWrapper: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    title: {
        fontSize: 24,
        lineHeight: '120%',
        fontStyle: 'normal',
        fontWeight: 700,
    },
    placeholderDescription: {
        fontSize: 14,
        lineHeight: '18px',
        fontWeight: 400,
        color: theme.palette.maskColor.second,
        margin: theme.spacing(1.5, 0),
        backgroundColor: theme.palette.maskColor.bg,
        borderRadius: 8,
        padding: theme.spacing(2),
    },
}))

export const WalletStartUp = memo(function WalletStartUp() {
    const { classes } = useStyles()
    const matchResetWallet = useMatch(PopupRoutes.ResetWallet)
    const matchCreateWallet = useMatch(PopupRoutes.CreateWallet)

    const [, onEnterCreateWallet] = useAsyncFn(async () => {
        if (Sniffings.is_firefox) {
            window.close()
        }

        await Services.Helper.removePopupWindow()
    }, [])

    return (
        <Box className={classes.container} data-hide-scrollbar>
            <WalletSetupHeaderUI showBack={!!matchResetWallet || !!matchCreateWallet}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>
                        <Trans>Add Wallet</Trans>
                    </Typography>
                </Box>
            </WalletSetupHeaderUI>
            <Box className={classes.content} sx={{ gap: 1.5 }}>
                <Typography className={classes.placeholderDescription}>
                    <Trans>
                        Supports traditional wallet creation and import, creation of Firefly.social wallets via your X
                        account.
                    </Trans>
                </Typography>
                <ImportCreateWallet onChoose={onEnterCreateWallet} sx={{ flex: 'column', gap: 1.5 }} />
            </Box>
        </Box>
    )
})
