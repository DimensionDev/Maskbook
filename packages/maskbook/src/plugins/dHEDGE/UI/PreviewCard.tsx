import { useCallback } from 'react'
import QueryBuilderIcon from '@material-ui/icons/QueryBuilder'
import { makeStyles, createStyles, Card, Typography, Button, Grid } from '@material-ui/core'
import { useI18N } from '../../../utils/i18n-next-ui'
import { usePool } from '../hooks/usePool'
import { useRemoteControlledDialog } from '../../../utils/hooks/useRemoteControlledDialog'
import { PluginDHedgeMessages } from '../messages'
import { useDHedgePoolURL } from '../hooks/useDHedge'

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
            fontSize: 10,
            paddingTop: theme.spacing(1),
            paddingBottom: theme.spacing(1),
            display: 'flex',
            alignItems: 'center',
            '& svg': {
                marginRight: theme.spacing(0.5),
            },
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
    console.log(pool, error, loading)
    const pool_url = useDHedgePoolURL(props.address)

    //#region the invest dialog
    const [_, openInvestDialog] = useRemoteControlledDialog(PluginDHedgeMessages.events.InvestDialogUpdated)
    const onInvest = useCallback(() => {
        if (!pool) return
        openInvestDialog({
            open: true,
            address: props.address,
            managerName: pool.managerName,
            name: pool.name,
        })
    }, [pool, openInvestDialog])
    //#endregion

    if (loading) return <Typography>Loading...</Typography>
    if (error) return <Typography>Something went wrong.</Typography>
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
            <div className={classes.description}>
                <Typography variant="body2" color="textSecondary" className={classes.text}>
                    {pool.poolDetails}
                </Typography>
            </div>

            <div className={classes.data}>
                <div className={classes.meta}>
                    <QueryBuilderIcon fontSize="small" color="disabled" />
                    <Typography variant="body2" color="textSecondary">
                        Last update:
                    </Typography>
                </div>
                <div className={classes.meta}>
                    <Typography variant="body2" color="textSecondary">
                        By
                    </Typography>
                    {/* <Avatar
                        alt={grant.admin_profile.handle}
                        src={grant.admin_profile.avatar_url}
                        className={classes.avatar}
                    /> */}
                    {/* <Typography variant="body2" color="textSecondary">
                        {grant.admin_profile.handle}
                    </Typography> */}
                </div>
            </div>
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
                        href={pool_url}>
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
