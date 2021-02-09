import { LinearProgress, LinearProgressProps } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

interface StyledLinearProgress extends LinearProgressProps {
    barColor?: string
    backgroundColor?: string
}

const useStyles = makeStyles(() => {
    return {
        root: {
            height: 8,
            borderRadius: 5,
            backgroundColor: (props: StyledLinearProgress) => props.backgroundColor ?? 'rgba(255, 255, 255, 0.3)',
        },
        bar: {
            borderRadius: 5,
            backgroundColor: (props: StyledLinearProgress) => props.barColor ?? '#fff',
        },
    }
})

// Seriously, if you're styling a function component, use makeStyles.
export function StyledLinearProgress(props: StyledLinearProgress) {
    const classes = useStyles(props)
    return <LinearProgress classes={classes} {...props} />
}
