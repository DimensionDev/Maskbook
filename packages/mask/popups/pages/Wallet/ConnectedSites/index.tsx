import { memo } from 'react'
import { useTitle } from '../../../hooks/index.js'
import { Box, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import OriginCard from '../components/OriginCard/index.js'
import { useConnectedOrigins } from '../../../hooks/useConnectedOrigins.js'
import { Trans, useLingui } from '@lingui/react/macro'
import { useWallet } from '@masknet/web3-hooks-base'
import { EmptyStatus } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        display: 'flex',
        width: '100%',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '16px',
    },
    desc: {
        color: theme.palette.maskColor.second,
        fontSize: 14,
        fontWeight: 400,
        lineHeight: '18px',
    },
    cardList: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 0',
    },
}))

export const Component = memo(function ConnectedSites() {
    const { t } = useLingui()
    const { classes } = useStyles()
    useTitle(t`Connected sites`)
    const { data: origins } = useConnectedOrigins()
    const wallet = useWallet()

    if (!origins?.length)
        return (
            <Box className={classes.container} height="100%" justifyContent="center">
                <EmptyStatus>
                    <Trans>No websites connected to this wallet</Trans>
                </EmptyStatus>
            </Box>
        )

    return (
        <Box className={classes.container}>
            <Typography className={classes.desc}>
                <Trans>
                    {wallet?.name || 'Your wallet'} is connected to these sites, they can view your account address.
                </Trans>
            </Typography>
            <Box className={classes.cardList}>
                {origins?.map((origin) => <OriginCard key={origin} origin={origin} />)}
            </Box>
        </Box>
    )
})
