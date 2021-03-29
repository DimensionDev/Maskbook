import { makeStyles, Typography, Divider, Box, CircularProgress } from '@material-ui/core'

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'block',
        width: '150px',
        borderRadius: '10px',
        boxShadow: '0px 0px 3px 1px #ADADAD',
        marginRight: '10%',
        overflow: 'hidden',
    },
    topBox: {
        backgroundColor: theme.palette.mode === 'light' ? 'white' : null,
    },
    listButton: {
        backgroundColor: '#2946ba',
        borderRadius: '10px',
        margin: theme.spacing(1),
        width: '53%',
    },
    topText: {
        margin: theme.spacing(1),
    },
    buttonText: {
        textTransform: 'none',
        color: 'white',
    },
    bottomText: {
        fontSize: [12, '!important'],
    },
}))

export default function Loading() {
    const classes = useStyles()

    return (
        <div className={classes.root}>
            <Box className={classes.topBox} display="flex" justifyContent="center">
                <CircularProgress />
            </Box>
            <Divider />
            <Box display="flex" sx={{ backgroundColor: '#f7f7f7' }} justifyContent="center">
                <CircularProgress />
            </Box>

            <Box display="flex" sx={{ backgroundColor: '#f7f7f7' }} justifyContent="center">
                <Typography className={classes.bottomText}>
                    powered by <b>Ideamarket</b>
                </Typography>
            </Box>
        </div>
    )
}
