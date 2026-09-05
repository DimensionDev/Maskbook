import { memo } from 'react'
import { Trans } from '@lingui/react/macro'
import { Box, Typography } from '@mui/material'
import { ActionButton, makeStyles } from '@masknet/theme'
import { Icons } from '@masknet/icons'
import { PopupModalRoutes } from '@masknet/shared-base'
import { useModalNavigate } from '../../../../components/index.js'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        gap: 16,
        padding: 24,
        textAlign: 'center',
    },
    desc: {
        color: theme.vars.palette.maskColor.second,
        fontSize: 14,
        lineHeight: '18px',
    },
}))

export const ConnectWalletEmptyState = memo(function ConnectWalletEmptyState() {
    const { classes } = useStyles()
    const modalNavigate = useModalNavigate()

    return (
        <Box className={classes.container}>
            <Icons.Wallet size={64} />
            <Typography className={classes.desc}>
                <Trans>Connect a wallet to view your assets and activity.</Trans>
            </Typography>
            <ActionButton onClick={() => modalNavigate(PopupModalRoutes.SelectProvider)}>
                <Trans>Connect Wallet</Trans>
            </ActionButton>
        </Box>
    )
})
