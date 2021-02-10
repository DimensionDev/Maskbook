import { LinearProgress, LinearProgressProps } from '@material-ui/core'
import { makeStyles } from '@material-ui/core/styles'

interface StyledLinearProgress extends LinearProgressProps {
    barcolor?: string
    backgroundcolor?: string
}

const useStyles = makeStyles(() => {
    return {
        root: {
            height: 8,
            borderRadius: 5,
            backgroundColor: (props: StyledLinearProgress) => props.backgroundcolor ?? 'rgba(255, 255, 255, 0.3)',
        },
        bar: {
            borderRadius: 5,
            backgroundColor: (props: StyledLinearProgress) => props.barcolor ?? '#fff',
        },
    }
})

export function StyledLinearProgress(props: StyledLinearProgress) {
    const classes = useStyles(props)
    return <LinearProgress classes={classes} {...props} />
}
