import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../../utils/i18n-next-ui'
import { outcomeRegistry, param } from '../helpers'
import type { AzuroGame } from '@azuro-protocol/sdk'
import { RedeemButton } from './RedeemButton'

import type { UserBet } from '../types'
import { Live } from './Live'

const useStyles = makeStyles()((theme) => ({
    container: {
        width: 460,
        borderLeft: '1px solid var(--mask-twitter-border-line)',
        padding: theme.spacing(0, 1, 0, 3),
    },
    info: {
        padding: theme.spacing(0.5),
        borderRadius: 8,
    },
    label: { fontWeight: 300 },
    won: {
        color: theme.palette.success.main,
        fontWeight: 500,
    },
    lost: {
        color: theme.palette.error.main,
        fontWeight: 500,
    },
}))

interface BetInfosProps {
    bet: UserBet
    retry: () => void
}

export function BetInfos(props: BetInfosProps) {
    const { t } = useI18N()
    const { bet, retry } = props
    const { classes } = useStyles()

    return (
        <Grid container justifyContent="center" direction="column" className={classes.container} wrap="nowrap">
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t('plugin_azuro_status')} </Typography>
                <Typography>
                    {bet.gameInfo.state === 0 ? (
                        bet.gameInfo.startsAt > Date.now() ? (
                            t('plugin_azuro_pending')
                        ) : (
                            <Live />
                        )
                    ) : bet.gameInfo.state === 1 ? (
                        t('plugin_azuro_finished')
                    ) : bet.gameInfo.state === 2 ? (
                        t('plugin_azuro_canceled')
                    ) : null}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t('plugin_azuro_pick')} </Typography>
                <Typography>
                    {outcomeRegistry[bet.outcomeRegistryId](bet.gameInfo as AzuroGame)}{' '}
                    {bet.outcomeRegistryId === 9 ||
                    bet.outcomeRegistryId === 10 ||
                    bet.outcomeRegistryId === 11 ||
                    bet.outcomeRegistryId === 12 ||
                    bet.outcomeRegistryId === 13 ||
                    bet.outcomeRegistryId === 14
                        ? param[bet.paramId]
                        : null}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t('plugin_azuro_odd')} </Typography>
                <Typography>{bet.rate.toFixed(4)}</Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t('plugin_azuro_amount')} </Typography>
                <Typography title={bet.amount.toString()}>{bet.amount.toFixed(6)} USDT </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t('plugin_azuro_result')} </Typography>
                <Typography>
                    {bet.result > 0 && bet.gameInfo.state === 1 ? (
                        <span className={classes.won}>+{bet.result}</span>
                    ) : bet.result < 0 && bet.gameInfo.state === 1 ? (
                        <span className={classes.lost}>{bet.result}</span>
                    ) : bet.gameInfo.state === 2 ? (
                        <Typography>{bet.result}</Typography>
                    ) : (
                        <Typography>&#8212;</Typography>
                    )}
                </Typography>
            </Grid>
            <RedeemButton bet={bet} retry={retry} />
        </Grid>
    )
}
