import { RefreshIcon } from '@masknet/icons'
import { DarkColor } from '@masknet/theme/constants'
import { formatBalance } from '@masknet/web3-shared-evm'
import { CircularProgress, Grid, Link, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { useI18N } from '../../../utils'
import { COMMUNITY_URL } from '../constants'
import { useAccountBalance } from '../hooks/useAccountBalances'
import type { Pool } from '../types'
import { AccountPool } from './AccountPool'

const useStyles = makeStyles()((theme) => ({
    root: {
        boxShadow: 'none',
        border: `solid 1px ${theme.palette.divider}`,
        backgroundColor: '#290b5a',
        textAlign: 'center',
        padding: theme.spacing(2),
    },
    refresh: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
        fontSize: 'inherit',
    },
    progress: {
        bottom: theme.spacing(1),
        right: theme.spacing(1),
        padding: theme.spacing(1),
    },
    totalDeposits: {
        display: 'flex',
        justifyContent: 'space-between',
        background: 'linear-gradient(334deg,#4c249f 28%,rgba(255,119,225,.9) 164%),#290b5a',
        padding: theme.spacing(2, 4),
        borderRadius: theme.spacing(1),
        marginBottom: theme.spacing(1),
        color: DarkColor.textSecondary,
    },
    noAccountPool: {
        padding: theme.spacing(2, 4),
        color: DarkColor.textSecondary,
    },
    missingPool: {
        padding: theme.spacing(2, 4),
        color: '#7458df',
    },
    missingPoolLink: {
        color: 'inherit',
        '&:hover': {
            color: '#ffffff',
        },
    },
    pools: {
        margin: theme.spacing(1, 0),
    },
}))

interface AccountProps {
    pools: Pool[]
}

export function Account(props: AccountProps) {
    const { pools } = props

    const { t } = useI18N()
    const { classes } = useStyles()
    const { value: balances = [], loading, retry, error } = useAccountBalance(pools)

    if (loading) {
        return <CircularProgress className={classes.progress} color="primary" size={15} />
    }

    if (error) {
        return <RefreshIcon className={classes.refresh} color="primary" onClick={retry} />
    }

    const noZeroBalances = balances.filter((balance) => Number.parseInt(balance.account.ticketBalance, 10) !== 0)
    const totalUsdBalance = noZeroBalances
        .map((balance) => {
            const ticketBalance = Number.parseFloat(
                formatBalance(balance.account.ticketBalance, Number.parseInt(balance.pool.tokens.ticket.decimals, 10)),
            )
            const ticketUsdRate = balance.pool.tokens.ticket.usd
            if (!ticketUsdRate) return 0
            return ticketBalance * ticketUsdRate
        })
        .reduce((x, y) => x + y, 0)
        .toLocaleString()

    return (
        <Grid container direction="column" className={classes.root}>
            {noZeroBalances.length === 0 ? (
                <Grid item>
                    <Typography className={classes.noAccountPool} variant="h5" fontWeight="fontWeightBold">
                        {t('plugin_pooltogether_no_account_pool')}
                    </Typography>
                </Grid>
            ) : (
                <>
                    <Grid item className={classes.totalDeposits}>
                        <Typography variant="h5" fontWeight="fontWeightBold">
                            {t('plugin_pooltogether_my_deposits')}
                        </Typography>
                        <Typography variant="h5" fontWeight="fontWeightBold">
                            ${totalUsdBalance}
                        </Typography>
                    </Grid>
                    <Grid item className={classes.pools}>
                        {noZeroBalances.map((balance, i) => (
                            <AccountPool key={i} accountPool={balance} />
                        ))}
                    </Grid>
                </>
            )}
            <Grid item>
                <Typography className={classes.missingPool} variant="subtitle2" fontWeight="fontWeightBold">
                    {t('plugin_pooltogether_missing_pool')}
                    <Link
                        target="_blank"
                        className={classes.missingPoolLink}
                        rel="noopener noreferrer"
                        title="PoolTogether"
                        href={COMMUNITY_URL}>
                        {COMMUNITY_URL}
                    </Link>
                </Typography>
            </Grid>
        </Grid>
    )
}
