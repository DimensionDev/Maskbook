import { useCallback } from 'react'
import { makeStyles, createStyles, Card, Typography, Button, Grid, Divider } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePool, usePoolHistory } from '../hooks/usePool'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginDHedgeMessages } from '../messages'
import { useDHedgePoolURL } from '../hooks/useDHedge'
import { formatBalance } from '../../Wallet/formatter'
import { formatAmountPostfix } from '../utils'
import { Period } from '../types'
import { MaskColorVar } from '@dimensiondev/maskbook-theme'

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
            width: theme.spacing(2),
            height: theme.spacing(2),
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
    const { value: pool, error, loading } = usePool(props.address)

    const { value: perfHistory, error: errorHistory, loading: loadingHistory } = usePoolHistory(
        props.address,
        Period.D1,
    )
    console.log(perfHistory, errorHistory, loadingHistory)
    const currentPerformance = perfHistory?.slice(-1)[0]

    const poolUrl = useDHedgePoolURL(props.address)
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
            <div className={classes.title}>
                <Typography variant="h6" color="textPrimary">
                    {pool.name}
                </Typography>
            </div>
            <div className={classes.description}>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    Managed by {pool.managerName}
                </Typography>
            </div>
            <Divider />
            <div className={classes.meta}>
                <Grid container className={classes.meta} direction="column" spacing={0.5}>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.metaTitle}>
                            VALUE MANAGED
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
                            LIFETIME RETURN
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
                            RISK FACTOR
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
                <div className={classes.data}>
                    {/* <Typography variant="body2" color="textSecondary">
                        {grant.admin_profile.handle}
                    </Typography> */}
                </div>
            </div>
            <Divider />
            {/* <div className={classes.description}>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    {pool.poolDetails}
                </Typography>
            </div> */}
            {/* <div className={classes.logo}>
                <img src={grant.logo_url} />
            </div>
            <div className={classes.data}>
                <div className={classes.meta}>
                    <QueryBuilderIcon fontSize="small" color="disabled" />
                    <Typography variant="body2" color="textSecondary">
                        Last update: {grant.last_update_natural}
                    </Typography>
                </div>
                <div className={classes.meta}>
                    <Typography variant="body2" color="textSecondary">
                        By
                    </Typography>
                    <Avatar
                        alt={grant.admin_profile.handle}
                        src={grant.admin_profile.avatar_url}
                        className={classes.avatar}
                    />
                    <Typography variant="body2" color="textSecondary">
                        {grant.admin_profile.handle}
                    </Typography>
                </div>
            </div> */}
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
