import { memo } from 'react'
import { useAsyncFn } from 'react-use'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Sniffings } from '@masknet/shared-base'
import Services from '#services'
import { ImportCreateWallet } from '../ImportCreateWallet/index.js'
import { Trans } from '@lingui/macro'

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
        padding: theme.spacing(2, 0),
        display: 'flex',
        marginBottom: 12,
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
        fontWeight: 700,
        color: theme.palette.maskColor.third,
        marginTop: theme.spacing(1.5),
        textAlign: 'center',
    },
}))

export const WalletStartUp = memo(function WalletStartUp() {
    const { classes } = useStyles()

    const [, onEnterCreateWallet] = useAsyncFn(async () => {
        if (Sniffings.is_firefox) {
            window.close()
        }

        await Services.Helper.removePopupWindow()
    }, [])

    return (
        <Box className={classes.container} data-hide-scrollbar>
            <Box className={classes.content}>
                <Box className={classes.titleWrapper}>
                    <Typography className={classes.title}>
                        <Trans>Add Wallet</Trans>
                    </Typography>
                    <Typography className={classes.placeholderDescription}>
                        <Trans>Keep your transactions and assets safe with Mask Wallet.</Trans>
                    </Typography>
                </Box>
                <ImportCreateWallet onChoose={onEnterCreateWallet} />
            </Box>
        </Box>
    )
})
