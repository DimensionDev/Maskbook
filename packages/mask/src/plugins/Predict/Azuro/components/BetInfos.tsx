import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../locales'
import { outcomeRegistry, outcomeSecondParam, truncateDecimals } from '../helpers'
import { RedeemButton } from './RedeemButton'

import { OutcomesWithParam, UserBet, ConditionStatus } from '../types'
import { Live } from './Live'
import { useChainId } from '@masknet/plugin-infra/web3'
import { useBetToken } from '../hooks/useBetToken'
import { leftShift, NetworkPluginID, toFixed, toNumber } from '@masknet/web3-shared-base'
import { WinIcon } from '../icons/WinIcon.js'
import { LostIcon } from '../icons/LostIcon.js'
import classNames from 'classnames'

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
    icon: {
        height: 16,
        width: 16,
    },
    label: { fontWeight: 300 },
    iconStatus: {
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
    },
    won: {
        color: 'rgb(76, 175, 80)',
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
    const isNegativeResult = bet.result === 0
    const chainId = useChainId(NetworkPluginID.PLUGIN_EVM)
    const betToken = useBetToken(chainId)
    const odds = truncateDecimals(toNumber(leftShift(bet.rate, 9), 2))
    const amount = toFixed(leftShift(bet.amount, 18), 2)
    const result = truncateDecimals(toNumber(leftShift(bet.result, 18), 2))
    const isWon = isPositiveResult && bet.gameInfo.state === ConditionStatus.RESOLVED
    const isLost = isNegativeResult && bet.gameInfo.state === ConditionStatus.RESOLVED

    return (
        <Grid container justifyContent="center" direction="column" className={classes.container} wrap="nowrap">
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_status()} </Typography>
                {bet.gameInfo.state === ConditionStatus.CREATED ? (
                    bet.gameInfo.startsAt > Date.now() ? (
                        <Typography>{t.plugin_pending()}</Typography>
                    ) : (
                        <Live />
                    )
                ) : bet.isRedeemed || isWon ? (
                    <Typography className={classNames(classes.iconStatus, classes.won)}>
                        {!bet.isRedeemed ? <RedeemButton bet={bet} retry={retry} /> : null}
                        <WinIcon className={classes.icon} /> {t.plugin_won()}
                    </Typography>
                ) : isLost ? (
                    <Typography className={classes.iconStatus}>
                        <LostIcon className={classes.icon} /> {t.plugin_lost()}
                    </Typography>
                ) : bet.gameInfo.state === ConditionStatus.CANCELED ? (
                    <Typography>{t.plugin_canceled()}</Typography>
                ) : null}
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_pick()} </Typography>
                <Typography>
                    {outcomeRegistry[bet.outcomeRegistryId](bet.gameInfo)}&nbsp;
                    {outcomesWithParams.includes(bet.outcomeRegistryId) ? outcomeSecondParam[bet.paramId] : null}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_odd()} </Typography>
                <Typography>{odds}</Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_amount()} </Typography>
                <Typography title={amount}>
                    {amount} {betToken?.name}
                </Typography>
            </Grid>
            <Grid container justifyContent="space-between" className={classes.info}>
                <Typography className={classes.label}>{t.plugin_result()} </Typography>
                <Typography>
                    {bet.isRedeemed || isWon ? (
                        <span className={classes.won}>+{result}</span>
                    ) : isLost ? (
                        <span>{result}</span>
                    ) : bet.gameInfo.state === ConditionStatus.CANCELED ? (
                        <Typography>{result}</Typography>
                    ) : (
                        <Typography>&#8212;</Typography>
                    )}
                </Typography>
            </Grid>
        </Grid>
    )
}
