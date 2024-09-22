import { LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Alert, AlertTitle, Box } from '@mui/material'
import { memo } from 'react'
import { AirDropActivityItem } from './AirDropActivityItem.js'
import { useAirDropActivity } from '../../../hooks/useAirDropActivity.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { EmptyStatus } from '@masknet/shared'
import { useToggle } from 'react-use'
import { Trans } from '@lingui/macro'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
        minHeight: 424,
        position: 'relative',
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 456,
        width: '100%',
        flexDirection: 'column',
        padding: 0,
    },
    alert: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1.5),
        position: 'absolute',
        bottom: 16,
        left: 16,
        right: 16,
        borderRadius: 4,
        zIndex: 1,
    },
    alertTitle: {
        fontSize: 14,
        lineHeight: '18px',
        color: theme.palette.maskColor.main,
        marginBottom: 0,
    },
}))

export const AirDropActivities = memo(() => {
    const [open, toggle] = useToggle(true)
    const { classes } = useStyles()
    const { account } = useChainContext()

    const { data: activity, isPending, refetch } = useAirDropActivity(ChainId.Arbitrum)

    if (isPending)
        return (
            <Box className={classes.placeholder}>
                <LoadingBase size={24} />
            </Box>
        )

    if (activity) {
        return (
            <Box className={classes.container}>
                <AirDropActivityItem {...activity} onClaimSuccess={refetch} />
                {open ?
                    <Alert severity="info" onClose={toggle} className={classes.alert}>
                        <AlertTitle className={classes.alertTitle}>
                            <Trans>
                                To participate in airdrops, it is necessary to have enough native tokens in your wallet
                                on the specified network to cover the transaction costs.
                            </Trans>
                        </AlertTitle>
                    </Alert>
                :   null}
            </Box>
        )
    }
    return (
        <EmptyStatus className={classes.placeholder}>
            {!account ?
                <Trans>Please connect wallet</Trans>
            :   <Trans>No activities found.</Trans>}
        </EmptyStatus>
    )
})

AirDropActivities.displayName = 'AirDropActivities'
