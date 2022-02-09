import { Divider, Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { formatWeiToEther } from '@masknet/web3-shared-evm'
import { formatterToUSD } from '../utils'
import type { IdeaToken } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(2),
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        alignItems: 'center',
        '& svg': {
            marginRight: theme.spacing(0.5),
        },
    },
    title: {
        fontSize: 12,
    },
    value: {
        fontSize: 28,
    },
    meta: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(1),
    },
    description: {
        paddingTop: theme.spacing(1),
        paddingBottom: theme.spacing(1),
        maxWidth: '100%',
    },
    iframe: {
        width: '100%',
        height: '100%',
    },
    gains: {
        display: 'flex',
        alignItems: 'center',
        padding: theme.spacing(2),
    },
}))

interface StatsViewProps {
    ideaToken: IdeaToken
}

export function StatsView(props: StatsViewProps) {
    const { classes } = useStyles()
    const price = props.ideaToken.latestPricePoint.price
    const deposits = formatWeiToEther(props.ideaToken.daiInToken).toNumber()
    const supply = formatWeiToEther(props.ideaToken.supply).toFixed(0)
    const holders = props.ideaToken.holders

    return (
        <div className={classes.root}>
            <div className={classes.meta}>
                <Grid container direction="column" alignItems="center">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            PRICE
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.value}>
                            {formatterToUSD.format(price)}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            DEPOSITS
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.value}>
                            {formatterToUSD.format(deposits)}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            SUPPLY
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.value}>
                            {supply}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid container className={classes.meta} direction="column">
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textSecondary" className={classes.title}>
                            HOLDERS
                        </Typography>
                    </Grid>
                    <Grid item xs={6}>
                        <Typography variant="body2" color="textPrimary" className={classes.value}>
                            {holders}
                        </Typography>
                    </Grid>
                </Grid>
            </div>
            <Divider />
            <div className={classes.gains}>
                <Typography color="textPrimary">
                    If you buy $100 worth of shl0ms, and then others buy $10,000 more, <br />
                    <br />
                    Your buy would be worth ~$204, a +104% change.
                </Typography>
            </div>
        </div>
    )
}
