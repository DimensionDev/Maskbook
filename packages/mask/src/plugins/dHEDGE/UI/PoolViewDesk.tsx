import { UnknownIcon } from '@masknet/icons'
import { useRemoteControlledDialog, useStylesExtends } from '@masknet/shared'
import { makeStyles } from '@masknet/theme'
import { formatBalance } from '@masknet/web3-shared-evm'
import { Avatar, Button, CircularProgress, Link, Paper, Typography } from '@mui/material'
import BigNumber from 'bignumber.js'
import { useCallback } from 'react'
import { Trans } from 'react-i18next'
import { useI18N } from '../../../utils'
import { useAvatar } from '../hooks/useManager'
import { useRewards } from '../hooks/useReward'
import { PluginDHedgeMessages } from '../messages'
import type { Pool } from '../types'
import { formatAmountPostfix } from '../utils'
import { PerformanceChart } from './PerformanceChart'

const DIGIT_LENGTH = 18

const useStyles = makeStyles()((theme) => ({
    root: {
        backgroundColor: '#F6F8F8',
    },
    header: {
        display: 'flex',
        flexDirection: 'row',
        padding: theme.spacing(1),
    },
    icon: {
        width: 60,
        height: 60,
        borderRadius: '100%',
        padding: 4,
        backgroundColor: 'black',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: theme.spacing(0.5),
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    avatar: {
        borderRadius: '100%',
        width: '100%',
        height: '100%',
    },
    name: {
        flex: 1,
    },
    buttons: {
        '>:first-child': {
            marginRight: theme.spacing(1),
        },
        marginTop: 'auto',
        marginBottom: 'auto',
    },
    deck: {
        paddingLeft: theme.spacing(1),
        paddingRight: theme.spacing(1),
        marginTop: theme.spacing(1),
        '>:first-child': {
            marginBottom: theme.spacing(1),
        },
    },
    line: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    text: {
        flex: 1,
    },
}))
interface PoolViewDeskProps extends withClasses<'root'> {
    pool: Pool
    tokens?: string[]
    link: string
}
export function PoolViewDesk(props: PoolViewDeskProps) {
    const { pool, tokens, link } = props
    const { t } = useI18N()
    const classes = useStylesExtends(useStyles(), props)

    //avatar
    const blockie = useAvatar(pool?.managerAddress ?? '')
    const valueManaged = formatAmountPostfix(formatBalance(pool?.totalValue ?? 0, DIGIT_LENGTH))
    const lifeTimeReturn = new BigNumber(formatBalance(pool?.performance ?? 0, DIGIT_LENGTH))
        .minus(1)
        .multipliedBy(100)
        .toFixed(2)
    const riskFactor = pool && pool?.riskFactor !== -1 ? pool?.riskFactor : '-'
    const { loading: loadingRewards, value: rewards } = useRewards()

    //#region the invest dialog
    const { setDialog: openInvestDialog } = useRemoteControlledDialog(PluginDHedgeMessages.InvestDialogUpdated)
    const onInvest = useCallback(() => {
        if (!pool || !tokens) return
        openInvestDialog({
            open: true,
            pool: pool,
            tokens: tokens,
        })
    }, [pool, tokens, openInvestDialog])
    //#endregion

    return (
        <Paper elevation={0} className={classes.root}>
            <div className={classes.header}>
                <Link className={classes.icon} target="_blank" rel="noopener noreferrer" href={link}>
                    <Avatar src={blockie} className={classes.avatar} />
                </Link>
                <div className={classes.name}>
                    <Typography variant="body1" color="textPrimary">
                        {pool.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" />
                </div>
                <div className={classes.buttons}>
                    <Button variant="contained" size="small" onClick={onInvest}>
                        {t('plugin_dhedge_invest')}
                    </Button>
                    <Button variant="contained" size="small">
                        Exit
                    </Button>
                </div>
            </div>
            <div className={classes.deck}>
                <div className={classes.line}>
                    <DeskItem name={<Trans i18nKey="plugin_dhedge_value_managed" />} value={`$${valueManaged}`} />
                    <DeskItem
                        name={<Trans i18nKey="plugin_dhedge_lifetime_return" />}
                        value={`${lifeTimeReturn}%`}
                        tip="tips"
                    />
                </div>
                <div className={classes.line}>
                    <DeskItem
                        name={<Trans i18nKey="plugin_dhedge_risk_factor" />}
                        value={`${riskFactor}/5`}
                        tip="tips"
                    />
                    <DeskItem
                        name={<Trans i18nKey="plugin_dhedge_rewards" />}
                        value={rewards ?? '0%'}
                        tip="tips"
                        loading={loadingRewards}
                    />
                </div>
            </div>
            <PerformanceChart pool={pool} />
        </Paper>
    )
}

const useItemStyles = makeStyles()((theme) => ({
    item: {
        display: 'flex',
        flexDirection: 'row',
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontWeight: 600,
        marginRight: theme.spacing(1),
    },
    value: {
        fontWeight: 600,
    },
    icon: {
        color: theme.palette.text.secondary,
        width: 14,
        height: 14,
        marginRight: theme.spacing(1),
    },
}))

interface DeskItemProps {
    name: string | React.ReactElement
    value: string
    color?: string
    tip?: string
    loading?: boolean
}
function DeskItem(props: DeskItemProps) {
    const { classes } = useItemStyles()
    const { name, value, color, tip, loading } = props
    return (
        <div className={classes.item}>
            <Typography className={classes.title} variant="body2" color="textSecondary">
                {name}:
            </Typography>

            {tip ? (
                <Typography sx={{ lineHeight: 1, marginLeft: 0.5, cursor: 'pointer' }} color="textPrimary" title={tip}>
                    <UnknownIcon className={classes.icon} />
                </Typography>
            ) : null}

            {loading ? (
                <CircularProgress size="small" />
            ) : (
                <Typography className={classes.value} variant="body2" color={color ?? 'textPrimary'}>
                    {value}
                </Typography>
            )}
        </div>
    )
}
