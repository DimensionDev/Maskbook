import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        position: 'relative',
        padding: theme.spacing(0.5),
        justifyContent: 'center',
        flexDirection: 'column',
    },
}))

export function PoolsView() {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            <span> Pool view </span>
        </div>
    )
}
