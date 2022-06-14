import type { ReactElement } from 'react'
import { Typography, Grid } from '@mui/material'
import { makeStyles } from '@masknet/theme'

import { useI18N } from '../../locales'
import type { RewardData } from '../../types'

const useStyles = makeStyles()((theme) => ({
    dataContainer: {
        flexFlow: 'wrap',
    },
}))

export interface RewardFarmPostWidgetProps extends React.PropsWithChildren<{}> {
    title?: string
    icon?: ReactElement
    rewardData?: RewardData
    tokenSymbol?: string
}

export function RewardFarmPostWidget({ title, icon, rewardData, tokenSymbol }: RewardFarmPostWidgetProps) {
    const t = useI18N()
    const { classes } = useStyles()

    return (
        <Grid item xs={12} marginTop="24px">
            {title && (
                <Grid item xs={12} container marginBottom="12px" alignItems="center">
                    {icon && icon}
                    <Grid item paddingX={1}>
                        <Typography fontWeight={600}>{title}</Typography>
                    </Grid>
                </Grid>
            )}
            <Grid container display="flex" flexDirection="column" className={classes.dataContainer}>
                <Grid item xs={12} display="flex" alignItems="center">
                    <Typography fontWeight={600}>
                        {t.daily_reward()}:{' '}
                        {rewardData ? (
                            <>
                                {Number.parseFloat(rewardData.dailyReward.toFixed(4))} {tokenSymbol ?? '-'}
                            </>
                        ) : (
                            '-'
                        )}
                    </Typography>
                </Grid>
                <Grid item xs={12} display="flex" alignItems="center">
                    <Typography fontWeight={600}>
                        {t.total_rewards()}:{' '}
                        {rewardData ? (
                            <>
                                {Number.parseFloat(rewardData.totalReward.toFixed(4))} {tokenSymbol ?? '-'}
                            </>
                        ) : (
                            '-'
                        )}
                    </Typography>
                </Grid>
            </Grid>
        </Grid>
    )
}
