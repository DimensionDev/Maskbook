import { Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        fontSize: '11px',
        lineHeight: '15px',
        fontFamily: '-apple-system,system-ui,sans-serif',
    },
    bar: {
        transform: 'translateY(5px)',
        '& div': {
            height: '8px ',
            borderRadius: '2px',
            // width: '90px !important',
            '&:last-child': {
                marginLeft: '2px',
            },
        },
    },
}))

export function CardButtom(props: any) {
    const { classes } = useStyles()
    const longWidth = 60 * 0.01 * 200
    const shortWidth = 40 * 0.01 * 200
    return (
        <Grid item container direction="row" className={classes.root}>
            <Grid item xs={10} direction="column">
                <Grid item container direction="row">
                    <Grid item xs={1} color="#32c682">
                        <span>Long</span>
                    </Grid>
                    <Grid item xs={1} color="#32c682">
                        <span>54%</span>
                    </Grid>
                    <Grid item xs={6} container direction="row" className={classes.bar}>
                        <div style={{ width: `${longWidth}px`, backgroundColor: '#32c682' }} />
                        <div style={{ width: `${shortWidth}px`, backgroundColor: '#e66362' }} />
                    </Grid>

                    <Grid item xs={1} color="#e66362" paddingLeft="20px">
                        <span>46%</span>
                    </Grid>
                    <Grid item xs={1} color="#e66362" paddingLeft="20px">
                        <span>SHORT</span>
                    </Grid>
                </Grid>
                <Grid item container direction="row" color="#FFF">
                    <Grid item xs={1}>
                        <span>11.00X</span>
                    </Grid>
                    <Grid item xs={1}>
                        <span>APY</span>
                    </Grid>
                    <Grid item xs={6} />
                    <Grid item xs={1} paddingLeft="20px">
                        <span>11.00X</span>
                    </Grid>
                    <Grid item xs={1} paddingLeft="20px">
                        <span>APY</span>
                    </Grid>
                </Grid>
            </Grid>
            <Grid item direction="column">
                <span>View Pool</span>
            </Grid>
        </Grid>
    )
}
