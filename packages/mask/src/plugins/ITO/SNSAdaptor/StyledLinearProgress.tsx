import { LinearProgress, LinearProgressProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((_theme) => ({}))

export function StyledLinearProgress(props: LinearProgressProps) {
    const { classes } = useStyles()
    return <LinearProgress classes={classes} {...props} />
}
