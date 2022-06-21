import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { outcomeRegistry, param } from '../helpers'
import type { AzuroGame } from '@azuro-protocol/sdk'
import { RedeemButton } from './RedeemButton'

import { OutcomesWithParam, UserBet, ConditionStatus } from '../types'
import { Live } from './Live'
import { useChainId } from '@masknet/plugin-infra/web3'
import { useBetToken } from '../hooks/useBetToken'
import { NetworkPluginID } from '@masknet/web3-shared-base'

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
    const t = useI18N()
    const { bet, retry } = props
    const { classes } = useStyles()
    const outcomesWithParams = Object.values(OutcomesWithParam)
    const isPositiveResult = bet.result > 0
    const isNegativeResult = bet.result < 0
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const betToken = useBetToken(chainId)

    return (
        <Grid container justifyContent="center" direction="column" className={classes.container} wrap="nowrap">
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_status()} </Typography>
                <Typography>
                    {bet.gameInfo.state === ConditionStatus.CREATED ? (
                        bet.gameInfo.startsAt > Date.now() ? (
                            t.plugin_pending()
                        ) : (
                            <Live />
                        )
                    ) : bet.gameInfo.state === ConditionStatus.RESOLVED ? (
                        t.plugin_finished()
                    ) : bet.gameInfo.state === ConditionStatus.CANCELED ? (
                        t.plugin_canceled()
                    ) : null}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_pick()} </Typography>
                <Typography>
                    {outcomeRegistry[bet.outcomeRegistryId](bet.gameInfo as AzuroGame)}{' '}
                    {outcomesWithParams.includes(bet.outcomeRegistryId) ? param[bet.paramId] : null}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_odd()} </Typography>
                <Typography>{bet.rate.toFixed(4)}</Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_amount()} </Typography>
                <Typography title={bet.amount.toString()}>
                    {bet.amount.toFixed(6)} {betToken?.name}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_result()} </Typography>
                <Typography>
                    {isPositiveResult && bet.gameInfo.state === ConditionStatus.RESOLVED ? (
                        <span className={classes.won}>+{bet.result}</span>
                    ) : isNegativeResult && bet.gameInfo.state === ConditionStatus.RESOLVED ? (
                        <span className={classes.lost}>{bet.result}</span>
                    ) : bet.gameInfo.state === ConditionStatus.CANCELED ? (
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
