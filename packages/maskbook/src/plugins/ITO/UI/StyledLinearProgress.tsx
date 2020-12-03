import { withStyles, LinearProgress } from '@material-ui/core'

export const StyledLinearProgress = withStyles({
    root: {
        height: 8,
        borderRadius: 5,
        background: 'rgba(255, 255, 255, 0.3)',
    },
    bar: {
        borderRadius: 5,
        backgroundColor: '#F66076',
    },
})(LinearProgress)
