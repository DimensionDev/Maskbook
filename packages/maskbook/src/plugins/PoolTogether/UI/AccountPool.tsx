import { TokenIcon } from '@masknet/shared'
import { MaskColorVar } from '@masknet/theme'
import { formatBalance, useChainId } from '@masknet/web3-shared'
import { Grid, Link, makeStyles, Typography } from '@material-ui/core'
import { PoolTogetherTrophy } from '../../../resources/PoolTogetherIcon'
import { useI18N } from '../../../utils'
import { useManagePoolURL } from '../hooks/usePoolURL'
import type { AccountPool } from '../types'
import { calculateNextPrize, calculateOdds, calculateSecondsRemaining } from '../utils'
import { CountdownView } from './CountdownView'
import { NetworkView } from './NetworkVIew'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'center',
        backgroundColor: '#341762',
        textAlign: 'center',
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        fontSize: 15,
    },
    token: {
        padding: theme.spacing(1, 2),
        borderRight: '#290b5a dashed',
        margin: 'auto',
    },
    tokenIcon: {
        backgroundColor: 'transparent',
        display: 'flex',
        margin: 'auto',
        justifyContent: 'center',
    },
    info: {
        padding: theme.spacing(1, 2),
        justifyContent: 'space-between',
        textAlign: 'justify',
    },
    prize: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        margin: 'auto 0',
        width: 'auto',
    },
    trophy: {
        margin: 'auto',
    },
    prizeAmount: {
        marginRight: theme.spacing(0.5),
    },
    in: {
        marginRight: theme.spacing(0.5),
    },
    manage: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        fontSize: '0.6rem',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        maxHeight: theme.spacing(1),
        '&:hover': {
            color: '#ffffff',
        },
    },
    countdown: {
        alignSelf: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    countdownDigit: {
        backgroundColor: 'transparent',
        color: MaskColorVar.textSecondary,
    },
    countdownSeperator: {
        color: MaskColorVar.textSecondary,
    },
    odds: {
        fontSize: '0.6rem',
    },
    item: {
        width: 'auto',
    },
    footer: {
        display: 'block',
        alignSelf: 'flex-end',
        textAlign: 'end',
    },
}))

interface AccountPoolProps {
    accountPool: AccountPool
}

export function AccountPool(props: AccountPoolProps) {
    const { accountPool } = props
    const token = accountPool.pool.tokens.underlyingToken

    const { t } = useI18N()
    const classes = useStyles()

    const poolURL = useManagePoolURL(accountPool.pool)
    const chainId = useChainId()

    const formatedBalance = Number.parseFloat(
        formatBalance(accountPool.account.ticketBalance, Number.parseInt(accountPool.pool.tokens.ticket.decimals, 10)),
    ).toLocaleString(undefined, {
        maximumFractionDigits: 6,
    })

    const odds = calculateOdds(
        Number.parseFloat(formatedBalance),
        Number.parseFloat(accountPool.pool.tokens.ticket.totalSupply),
        Number.parseInt(accountPool.pool.config.numberOfWinners, 10),
    )

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid container direction="column" item xs={3} className={classes.token}>
                <Grid item className={classes.tokenIcon}>
                    <TokenIcon address={token.address} name={token.symbol} />
                </Grid>
                <Grid item>
                    <Typography color="textSecondary" variant="subtitle1" fontWeight="fontWeightBold">
                        {token.symbol}
                    </Typography>
                </Grid>
            </Grid>
            <Grid container item xs={9} className={classes.info}>
                <Grid item className={classes.item}>
                    <Typography color="textSecondary" variant="h5" fontWeight="fontWeightBold">
                        {formatedBalance}
                    </Typography>
                    <Typography className={classes.odds} color="textSecondary" variant="subtitle2">
                        {t('plugin_pooltogether_winning_odds')}
                    </Typography>
                    <Typography className={classes.odds} color="textSecondary" variant="subtitle2">
                        {odds
                            ? t('plugin_pooltogether_short_odds_value', {
                                  value: odds,
                              })
                            : 'n/a'}
                    </Typography>
                </Grid>
                <Grid container direction="column" item className={classes.item}>
                    <Grid item className={classes.prize}>
                        <PoolTogetherTrophy className={classes.trophy} />
                        <Typography
                            className={classes.prizeAmount}
                            color="textSecondary"
                            variant="h6"
                            fontWeight="fontWeightBold">
                            $
                            {calculateNextPrize(accountPool.pool).toLocaleString(undefined, {
                                maximumFractionDigits: 0,
                            })}
                        </Typography>
                        <Typography
                            className={classes.in}
                            color="textSecondary"
                            variant="subtitle2"
                            fontWeight="fontWeightBold">
                            {t('plugin_pooltogether_in')}
                        </Typography>
                        <CountdownView
                            secondsRemaining={calculateSecondsRemaining(accountPool.pool)}
                            msgOnEnd={t('plugin_pooltogether_pool_ended')}
                            classes={{ digit: classes.countdownDigit, seperator: classes.countdownSeperator }}
                        />
                    </Grid>
                    <Grid item className={classes.footer}>
                        <NetworkView chainId={chainId} />
                        <Link className={classes.manage} target="_blank" rel="noopener noreferrer" href={poolURL}>
                            <Typography variant="subtitle2">{t('plugin_pooltogether_manage')}</Typography>
                        </Link>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
