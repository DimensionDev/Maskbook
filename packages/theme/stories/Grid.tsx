import * as React from 'react'
import { makeStyles, createStyles, Theme } from '@material-ui/core/styles'
import Grid, { GridSpacing } from '@material-ui/core/Grid'
import FormLabel from '@material-ui/core/FormLabel'
import Paper from '@material-ui/core/Paper'
import { Slider } from '@material-ui/core'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        control: {
            padding: theme.spacing(2),
        },
    }),
)

export default function SpacingGrid() {
    const [spacing, setSpacing] = React.useState<GridSpacing>(2)
    const classes = useStyles()

    return (
        <Grid container className={classes.root} spacing={2}>
            <Grid item xs={12}>
                <Grid container spacing={spacing}>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((value) => (
                        <Grid key={value} item>
                            <Paper children={value} />
                        </Grid>
                    ))}
                </Grid>
            </Grid>
            <Grid item xs={12}>
                <Paper className={classes.control}>
                    <Grid container>
                        <Grid item xs={12}>
                            <FormLabel>spacing</FormLabel>
                            <Slider
                                min={0}
                                max={10}
                                defaultValue={1}
                                step={1}
                                valueLabelDisplay="auto"
                                onChange={(e, v) => {
                                    setSpacing(v as any)
                                }}
                                value={spacing}
                            />
                        </Grid>
                    </Grid>
                </Paper>
            </Grid>
        </Grid>
    )
}
