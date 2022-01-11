import { LinearProgress, LinearProgressProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((_theme) => ({
    root: {
        height: 8,
        borderRadius: 5,
    },
    bar: {
        borderRadius: 5,
    },
}))

export function StyledLinearProgress(props: LinearProgressProps) {
    const { classes } = useStyles()
    return <LinearProgress classes={classes} {...props} />
}
