import { LinearProgress, LinearProgressProps } from '@mui/material'
import { makeStyles } from '@masknet/theme'
interface StyledLinearProgress extends LinearProgressProps {
    barColor?: string
    backgroundColor?: string
}

const useStyles = makeStyles<StyledLinearProgress>()((_theme, props) => ({
    root: {
        height: 8,
        borderRadius: 5,
        backgroundColor: props.backgroundColor ?? 'rgba(255, 255, 255, 0.3)',
    },
    bar: {
        borderRadius: 5,
        backgroundColor: props.barColor ?? 'rgb(44, 164, 239)',
    },
}))

export function StyledLinearProgress({ backgroundColor, barColor, ...props }: StyledLinearProgress) {
    const { classes } = useStyles(props)
    return <LinearProgress classes={classes} {...props} />
}
