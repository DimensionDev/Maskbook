import { formatBalance } from '@masknet/web3-shared'
import { makeStyles, Grid, Typography } from '@material-ui/core'
import type { GoodGhostingInfo } from '../types'
import { CircularDataDisplay } from './CircularDataDisplay'

const useStyles = makeStyles((theme) => ({
    infoRow: {
        paddingBottom: theme.spacing(1),
    },
    circularDataSection: {
        paddingTop: theme.spacing(2),
    },
    circularDataWrapper: {
        minWidth: '80px',
    },
    circularData: {
        padding: theme.spacing(1),
        maxWidth: '100px',
        margin: 'auto',
    },
}))

interface GameStatsViewProps {
    info: GoodGhostingInfo
}

export function GameStatsView(props: GameStatsViewProps) {
    const classes = useStyles()
    return (
        <>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Game Duration:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {props.info.gameLengthFormatted}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Current Round:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {props.info.currentSegment + 1} / {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Deposit Per Round:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {formatBalance(props.info.segmentPayment, 18)} DAI
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Round Length:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {props.info.segmentLengthFormatted}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>

            <div className={classes.circularDataSection}>
                <Grid className={classes.infoRow} container justifyContent={'center'}>
                    <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={'Total Saved'}
                                title={formatBalance(props.info.totalGamePrincipal, 18)}
                                subtitle={'DAI'}
                            />
                        </div>
                    </Grid>
                    <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={'Total Saved'}
                                title={formatBalance(props.info.totalGamePrincipal, 18)}
                                subtitle={'DAI'}
                            />
                        </div>
                    </Grid>
                </Grid>
                <Grid className={classes.infoRow} container justifyContent={'center'}>
                    <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={'Total Saved'}
                                title={formatBalance(props.info.totalGamePrincipal, 18)}
                                subtitle={'DAI'}
                            />
                        </div>
                    </Grid>
                    <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                        <div className={classes.circularData}>
                            <CircularDataDisplay
                                header={'Total Saved'}
                                title={formatBalance(props.info.totalGamePrincipal, 18)}
                                subtitle={'DAI'}
                            />
                        </div>
                    </Grid>
                </Grid>
            </div>
        </>
    )
}
