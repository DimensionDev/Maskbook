import { useCallback } from 'react'
import { makeStyles, createStyles, Card, Typography, Button, Grid, Divider, Link, Avatar } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useFetchPool, useFetchPoolHistory } from '../hooks/usePool'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginDHedgeMessages } from '../messages'
import { formatBalance } from '../../Wallet/formatter'
import { formatAmountPostfix } from '../utils'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'
import { Trans } from 'react-i18next'
import { resolveAddressLinkOnEtherscan } from '../../../web3/pipes'
import { useChainId } from '../../../web3/hooks/useBlockNumber'
import { Period } from '../types'
import { PerformanceChart } from './PerformanceChart'
import { usePoolURL } from '../hooks/useUrl'
import { useAvatar } from '../hooks/useManager'

const useStyles = makeStyles((theme) =>
    createStyles({
        root: {
            padding: theme.spacing(2),
        },
        logo: {
            textAlign: 'center',
            '& > *': {
                width: 'auto',
                height: 100,
            },
        },
        title: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& > :last-child': {
                marginTop: 4,
                marginLeft: 4,
            },
        },
        description: {
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
        },
        data: {
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        },
        meta: {
            fontSize: 16,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& svg': {
                marginRight: theme.spacing(0.5),
            },
        },
        metaTitle: {
            fontSize: 16,
        },
        metaValue: {
            fontSize: 32,
        },
        avatar: {
            width: theme.spacing(8),
            height: theme.spacing(8),
            margin: theme.spacing(0, 1),
        },
        buttons: {
            padding: theme.spacing(4, 0, 0),
        },
        verified: {
            borderRadius: 50,
        },
        text: {
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            '-webkit-line-clamp': '4',
            '-webkit-box-orient': 'vertical',
        },
    }),
)

interface PreviewCardProps {
    address: string
}

export function PreviewCard(props: PreviewCardProps) {
    const { t } = useI18N()
    const classes = useStyles()

    const chainId = useChainId()

    const { value: pool, error, loading } = useFetchPool(props.address)

    const poolUrl = usePoolURL(props.address)
    const blockie = useAvatar(pool?.managerAddress ?? '0x0')

    const { value: perfHistory, error: errorHistory, loading: loadingHistory } = useFetchPoolHistory(
        props.address,
        Period.D1,
    )
    const currentPerformance = perfHistory?.slice(-1)[0]

    const valueManaged = formatAmountPostfix(formatBalance(Number(pool?.totalValue), 18))
    const lifeTimeReturn = Number((parseFloat(currentPerformance?.performance ?? '0') * 100).toFixed(2))
    const riskFactor = pool && pool?.riskFactor != -1 ? pool?.riskFactor : '-'

    //#region the invest dialog
    const [_, openInvestDialog] = useRemoteControlledDialog(PluginDHedgeMessages.events.InvestDialogUpdated)
    const onInvest = useCallback(() => {
        if (!pool) return
        openInvestDialog({
            open: true,
            address: props.address,
            name: pool.name,
        })
    }, [pool, openInvestDialog])
    //#endregion

    if (loading || loadingHistory) return <Typography>Loading...</Typography>
    if (error || errorHistory) return <Typography>Something went wrong.</Typography>
    if (!pool) return null

    return (
        <Card variant="outlined" className={classes.root} elevation={0}>
            <Grid container className={classes.meta} direction="row" spacing={0.5}>
                <Grid item>
                    <Avatar alt={''} src={blockie} className={classes.avatar} />
                </Grid>
                <Grid item>
                    <div className={classes.title}>
                        <Typography variant="h6" color="textPrimary">
                            {pool.name}
                        </Typography>
                    </div>
                    <div className={classes.description}>
                        <Typography variant="body2" color="textSecondary" className={classes.text}>
                            <Trans
                                i18nKey="plugin_dhedge_managed_by"
                                components={{
                                    manager: (
                                        <Link
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            href={resolveAddressLinkOnEtherscan(chainId, pool.managerAddress)}
                                        />
                                    ),
                                }}
                                values={{
                                    managerName: pool.managerName,
                                }}
                            />
                            <Link target="_blank" rel="noopener noreferrer" href={pool.managerName} />
                        </Typography>
                    </div>
                </Grid>
            </Grid>
            <Divider />
            <div className={classes.meta}>
                <Grid container className={classes.meta} direction="column" spacing={0.5}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.metaTitle}>
                            <Trans i18nKey="plugin_dhedge_value_managed" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.metaValue}>
                            {valueManaged}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.metaTitle}>
                            <Trans i18nKey="plugin_dhedge_lifetime_return" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body2"
                            color={
                                lifeTimeReturn > 0
                                    ? MaskColorVar.greenMain
                                    : lifeTimeReturn < 0
                                    ? MaskColorVar.redMain
                                    : 'textPrimary'
                            }
                            className={classes.metaValue}>
                            {lifeTimeReturn}%
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column" spacing={1}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.metaTitle}>
                            <Trans i18nKey="plugin_dhedge_risk_factor" />
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography
                            variant="body2"
                            color={
                                riskFactor === '-' || riskFactor === 3
                                    ? 'textPrimary'
                                    : riskFactor < 3
                                    ? MaskColorVar.greenMain
                                    : MaskColorVar.redMain
                            }
                            className={classes.metaValue}>
                            {riskFactor} / 5
                        </Typography>
                    </Grid>
                </Grid>
            </div>
            <Divider />
            <div className={classes.data}></div>
            <PerformanceChart address={props.address} />
            <Grid container className={classes.buttons} spacing={2}>
                <Grid item xs={6}>
                    <Button
                        variant="outlined"
                        fullWidth
                        color="primary"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={poolUrl}>
                        View on dHEDGE
                    </Button>
                </Grid>
                <Grid item xs={6}>
                    <Button variant="contained" fullWidth color="primary" onClick={onInvest}>
                        Invest
                    </Button>
                </Grid>
            </Grid>
        </Card>
    )
}
