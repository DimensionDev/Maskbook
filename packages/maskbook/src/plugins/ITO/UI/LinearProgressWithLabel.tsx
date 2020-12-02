import { makeStyles, createStyles, withStyles, LinearProgress } from '@material-ui/core'

interface ProgressProps {
    value: number
}

const useStyles = makeStyles((theme) =>
    createStyles({
        span: {
            position: 'relative',
            left: (props: ProgressProps) => props.value + '%',
            transform: 'translateX(-50%)',
            display: 'inline-block',
            marginBottom: 2,
        },
    }),
)

const StyledLinearProgress = withStyles({
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

export default (props: ProgressProps) => {
    const classes = useStyles(props)
    return (
        <>
            <span className={classes.span}>{props.value}%</span>
            <StyledLinearProgress variant="determinate" value={props.value} />
        </>
    )
}
