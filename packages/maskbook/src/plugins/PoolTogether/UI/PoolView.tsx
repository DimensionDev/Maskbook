import { first } from 'lodash-es'
import type { Pool } from '../types'
import { Typography, Grid, CircularProgress, Button } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { useChainId, useERC20TokenDetailed } from '@masknet/web3-shared'
import { RefreshIcon } from '@masknet/icons'
import { usePoolURL } from '../hooks/usePoolURL'
import { CountdownView } from './CountdownView'
import { PluginPoolTogetherMessages } from '../messages'
import { useCallback, useEffect, useState } from 'react'
import { calculateNextPrize, calculateSecondsRemaining, getPrizePeriod } from '../utils'
import { NetworkView } from './NetworkView'
import { useI18N } from '../../../utils'
import { TokenIcon, useRemoteControlledDialog } from '@masknet/shared'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 2),
        alignItems: 'stretch',
        backgroundColor: '#341762',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(1),
        '&:hover': {
            backgroundColor: '#43286e',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: theme.spacing(4),
        height: theme.spacing(4),
        marginRight: theme.spacing(1),
        backgroundColor: 'transparent',
    },
    button: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(1),
        fontWeight: 500,
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
    poolLink: {
        cursor: 'pointer',
        color: 'inherit',
        textDecoration: 'inherit',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
    },
    networkIcon: {
        width: '1em',
        height: '1em',
        backgroundColor: 'transparent',
        marginRight: theme.spacing(0.5),
    },
    metaTitle: {
        marginBottom: theme.spacing(1),
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaFooter: {
        justifyContent: 'inherit',
        alignItems: 'center',
    },
    metaText: {
        marginTop: theme.spacing(1),
        justifyContent: 'inherit',
    },
    metaTextPrize: {
        color: '#55f1d7',
        margin: theme.spacing(0, 1),
        backgroundColor: 'rgba(53, 230, 208, 0.2)',
        borderRadius: theme.spacing(1),
        padding: theme.spacing(0, 0.5),
    },
    metaPrize: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(1),
        borderRadius: theme.spacing(1),
        backgroundColor: '#290B5A',
        justifyContent: 'center',
        maxWidth: '50%',
    },
    metaDeposit: {
        marginTop: theme.spacing(1),
        padding: theme.spacing(0, 1),
        justifyContent: 'center',
        maxWidth: '50%',
    },
    prize: {
        background:
            'linear-gradient(40deg,#ff9304,#ff04ea 10%,#9b4beb 20%,#0e8dd6 30%,#0bc6df 40%,#07d464 50%,#dfd105 60%,#ff04ab 78%,#8933eb 90%,#3b89ff)',
        '-webkit-background-clip': 'text',
        color: 'transparent',
        animation: '$rainbow_animation 6s linear infinite',
        backgroundSize: '600% 600%',
        fontSize: '1.2rem',
        '@media (min-width:600px)': {
            fontSize: '2rem',
        },
    },
    '@keyframes rainbow_animation': {
        '0%': {
            backgroundPosition: '100% 0%',
        },
        '100%': {
            backgroundPosition: '0 100%',
        },
    },
    countdown: {
        alignSelf: 'center',
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
    },
    deposit: {
        backgroundColor: '#3ef3d4',
        color: '#4c249f',
        marginTop: theme.spacing(0.5),
    },
    info: {
        marginTop: theme.spacing(0.5),
        justifyContent: 'space-between',
    },
    apr: {
        color: '#bdb3d2',
        display: 'flex',
    },
    poolIcon: {
        backgroundColor: 'transparent',
        marginRight: theme.spacing(0.5),
    },
    viewPool: {
        cursor: 'pointer',
        color: '#3ef3d4',
        textDecoration: 'none',
        marginRight: theme.spacing(0.5),
        '&:last-child': {
            marginRight: 0,
        },
        maxHeight: theme.spacing(1),
        '&:hover': {
            color: '#ffffff',
        },
    },
}))

interface PoolProps {
    pool: Pool
}

export function PoolView(props: PoolProps) {
    const { pool } = props
    const { classes } = useStyles()
    const { t } = useI18N()

    const poolURL = usePoolURL(pool)
    const chainId = useChainId()
    const [prize, setPrize] = useState('TBD')
    const [period, setPeriod] = useState('Custom Period')

    //#region pool token
    const {
        value: token,
        loading: loadingToken,
        retry: retryToken,
        error: errorToken,
    } = useERC20TokenDetailed(pool.tokens.underlyingToken.address)
    //#endregion

    //#region process data
    const prizePeriodSeconds = Number.parseInt(pool.config.prizePeriodSeconds, 10)
    useEffect(() => {
        setPrize(calculateNextPrize(pool))
        setPeriod(getPrizePeriod(t, prizePeriodSeconds))
    }, [pool])
    //#endregion

    //#region the deposit dialog
    const { setDialog: openDepositDialog } = useRemoteControlledDialog(PluginPoolTogetherMessages.DepositDialogUpdated)

    const onDeposit = useCallback(() => {
        if (!pool || !token) return
        openDepositDialog({
            open: true,
            pool: pool,
            token: token,
        })
    }, [pool, token, openDepositDialog])
    //#endregion

    if (loadingToken) {
        return (
            <div className={classes.root}>
                <CircularProgress className={classes.progress} color="primary" size={15} />
            </div>
        )
    }

    if (errorToken) {
        return (
            <div className={classes.root}>
                <RefreshIcon className={classes.refresh} color="primary" onClick={retryToken} />
            </div>
        )
    }

    if (!token) {
        return (
            <Typography className={classes.prize} variant="h5" fontWeight="fontWeightBold">
                {t('plugin_pooltogether_token_not_found')}
            </Typography>
        )
    }
    const tokenFaucet = first(pool.tokenFaucets)
    const tokenFaucetDripToken = first(pool.tokens.tokenFaucetDripTokens)

    return (
        <Grid container direction="row" className={classes.root}>
            <Grid item container direction="column" className={classes.metaPrize}>
                <Grid container item className={classes.metaTitle}>
                    <Grid item>
                        <TokenIcon address={token.address} name={token.symbol} classes={{ icon: classes.icon }} />
                    </Grid>
                    <Grid item>
                        <Typography className={classes.prize} variant="h4" fontWeight="fontWeightBold">
                            {prize}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container item xs={3} className={classes.metaFooter}>
                    <Grid item className={classes.metaTextPrize}>
                        <Typography fontSize={10} variant="subtitle2">
                            {t('plugin_pooltogether_prize', { period: period })}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <NetworkView chainId={chainId} />
                    </Grid>
                </Grid>
            </Grid>
            <Grid item container direction="column" className={classes.metaDeposit}>
                <Grid item className={classes.countdown}>
                    <CountdownView
                        secondsRemaining={calculateSecondsRemaining(pool)}
                        msgOnEnd={t('plugin_pooltogether_pool_ended')}
                    />
                </Grid>
                <Grid item>
                    <Button className={classes.deposit} variant="contained" fullWidth size="small" onClick={onDeposit}>
                        {t('plugin_pooltogether_deposit', { token: token.symbol })}
                    </Button>
                </Grid>
                <Grid container item className={classes.info}>
                    <Grid item>
                        {tokenFaucet && tokenFaucetDripToken ? (
                            <Typography className={classes.apr} fontSize="0.7rem" variant="subtitle2">
                                <TokenIcon
                                    address={tokenFaucetDripToken.address}
                                    name={tokenFaucetDripToken.symbol}
                                    classes={{ icon: classes.poolIcon }}
                                />
                                {t('plugin_pooltogether_apr', {
                                    apr: tokenFaucet.apr?.toFixed(2) ?? 0,
                                    token: tokenFaucetDripToken.symbol,
                                })}
                            </Typography>
                        ) : null}
                    </Grid>
                    <Grid item>
                        <a className={classes.viewPool} target="_blank" rel="noopener noreferrer" href={poolURL}>
                            <Typography fontSize="0.7rem" variant="subtitle2">
                                {t('plugin_pooltogether_view_pool')}
                            </Typography>
                        </a>
                    </Grid>
                </Grid>
            </Grid>
        </Grid>
    )
}
