import { Typography, Grid } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        padding: theme.spacing(1, 2),
        alignItems: 'stretch',
        backgroundColor: 'rgba(33, 39, 41, 0.65)',
        margin: theme.spacing(1, 0),
        borderRadius: theme.spacing(1),
        '&:hover': {
            backgroundColor: 'rgba(33, 39, 41, 0.384)',
        },
        fontSize: 14,
        display: 'flex',
        alignContent: 'center',
        justifyContent: 'center',
    },
}))

export function CardButtom(props: any) {
    const { classes } = useStyles()
    return (
        <Grid container direction="row">
            <Typography color="#FFF">APY and View Pool button</Typography>
        </Grid>
    )
}
