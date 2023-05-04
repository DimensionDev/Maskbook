import { LoadingBase, makeStyles } from '@masknet/theme'
import { useChainContext } from '@masknet/web3-hooks-base'
import { Box } from '@mui/material'
import { memo } from 'react'
import { useI18N } from '../../../locales/i18n_generated.js'
import { AirDropActivityItem } from './AirDropActivityItem.js'
import { useAirDropActivity } from '../../../hooks/useAirDropActivity.js'
import { ChainId } from '@masknet/web3-shared-evm'
import { EmptyStatus } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    container: {
        padding: theme.spacing(2),
        display: 'flex',
        flexDirection: 'column',
        rowGap: theme.spacing(1.5),
        minHeight: 392,
    },
    placeholder: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: 408,
        width: '100%',
        flexDirection: 'column',
        padding: 0,
    },
}))

export const AirDropActivities = memo(() => {
    const t = useI18N()
    const { classes } = useStyles()
    const { account } = useChainContext()

    const { value: activity, loading, retry } = useAirDropActivity(ChainId.Arbitrum)

    if (loading)
        return (
            <Box className={classes.placeholder}>
                <LoadingBase size={24} />
            </Box>
        )

    if (activity) {
        return (
            <Box className={classes.container}>
                <AirDropActivityItem {...activity} onClaimSuccess={retry} />
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
