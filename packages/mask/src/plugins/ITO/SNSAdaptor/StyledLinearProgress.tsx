import { LinearProgress, LinearProgressProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((_theme) => ({
    root: {
        height: 8,
        borderRadius: 5,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
    },
    bar: {
        borderRadius: 5,
        backgroundColor: _theme.palette.common.white,
    },
}))

export function StyledLinearProgress(props: LinearProgressProps) {
    const { classes } = useStyles()
    return <LinearProgress classes={classes} {...props} />
}
