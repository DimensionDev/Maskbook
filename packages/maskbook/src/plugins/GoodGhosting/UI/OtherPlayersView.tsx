import { makeStyles, Grid } from '@material-ui/core'
import type { PlayerStandings } from '../types'
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

interface OtherPlayersViewProps {
    standings: PlayerStandings
}

export function OtherPlayersView(props: OtherPlayersViewProps) {
    const classes = useStyles()
    return (
        <div className={classes.circularDataSection}>
            <Grid className={classes.infoRow} container justifyContent={'center'}>
                <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Winning'} title={`${props.standings.winning}`} />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Waiting'} title={`${props.standings.waiting}`} />
                    </div>
                </Grid>
            </Grid>
            <Grid className={classes.infoRow} container justifyContent={'center'}>
                <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Ghosts'} title={`${props.standings.ghosts}`} />
                    </div>
                </Grid>
                <Grid className={classes.circularDataWrapper} item xs={6} spacing={1}>
                    <div className={classes.circularData}>
                        <CircularDataDisplay header={'Drop-outs'} title={`${props.standings.dropouts}`} />
                    </div>
                </Grid>
            </Grid>
        </div>
    )
}
