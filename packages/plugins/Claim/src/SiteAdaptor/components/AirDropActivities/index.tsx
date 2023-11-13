import { LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Alert, AlertTitle, Box } from '@mui/material'
import { memo } from 'react'
import { useClaimTrans } from '../../../locales/i18n_generated.js'
import { AirDropActivityItem } from './AirDropActivityItem.js'
import { useAirDropActivity } from '../../../hooks/useAirDropActivity.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { EmptyStatus } from '@masknet/shared'
import { useToggle } from 'react-use'

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
    const t = useClaimTrans()
    const [open, toggle] = useToggle(true)
    const { classes } = useStyles()
    const { account } = useChainContext()

    const { data: activity, isLoading, refetch } = useAirDropActivity(ChainId.Arbitrum)

    if (isLoading)
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
                        <AlertTitle className={classes.alertTitle}>{t.airdrop_alert()}</AlertTitle>
                    </Alert>
                :   null}
            </Box>
        )
    }
    return (
        <EmptyStatus className={classes.placeholder}>
            {!account ? t.connect_wallet_airdrop_tips() : t.no_activities_tips()}
        </EmptyStatus>
    )
})

AirDropActivities.displayName = 'AirDropActivities'
