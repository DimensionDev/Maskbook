import { makeStyles, Grid, Typography } from '@material-ui/core'
import type { GoodGhostingInfo, Player } from '../types'

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

interface PersonalViewProps {
    player?: Player
    info: GoodGhostingInfo
}

export function PersonalView(props: PersonalViewProps) {
    const classes = useStyles()

    if (!props.player) {
        return (
            <Typography variant="h6" color="textSecondary">
                Looks like you're not a participant in this game
            </Typography>
        )
    }

    let status = 'Unknown'
    const mostRecentSegmentPaid = Number.parseInt(props.player.mostRecentSegmentPaid)
    const currentSegment = props.info.currentSegment
    if (props.player.withdrawn) status = 'Withdrawn'
    else if (mostRecentSegmentPaid < currentSegment - 1) status = 'Ghost'
    else if (mostRecentSegmentPaid === currentSegment - 1) status = 'Waiting'
    else if (mostRecentSegmentPaid === currentSegment) status = 'Winning'

    return (
        <>
            <Grid className={classes.infoRow} container spacing={2}>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Status:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {status}
                        </Typography>
                    </Grid>
                </Grid>
                <Grid item container xs={6} spacing={1}>
                    <Grid item>
                        <Typography variant="body1" color="textPrimary">
                            Deposits made:
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Typography variant="body1" color="textSecondary">
                            {mostRecentSegmentPaid + 1} / {props.info.lastSegment}
                        </Typography>
                    </Grid>
                </Grid>
            </Grid>
        </>
    )
}
