import { Grid, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    date: { fontSize: 14, fontWeight: 300 },
}))

interface EventDateProps {
    date: number
}

export function EventDate(props: EventDateProps) {
    const { date } = props
    const { classes } = useStyles()

    const dateToUTC = new Date(date).toUTCString()

    return (
        <Grid>
            <Typography className={classes.date}>{dateToUTC}</Typography>
        </Grid>
    )
}
