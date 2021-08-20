import { Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'

const useStyles = makeStyles()((theme) => ({
    root: {
        textAlign: 'center',
    },
    header: {
        whiteSpace: 'nowrap',
        paddingBottom: theme.spacing(0.5),
    },
    circleData: {
        width: '100%',
        paddingTop: 'calc(100% - 16px)',
        boxSizing: 'border-box',
        position: 'relative',
        borderRadius: '100%',
        border: '8px solid #6Eb0FC',
    },
    circleDataText: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        top: '0px',
        left: '0px',
        bottom: '0px',
        right: '0px',
    },
}))

interface CircularDataDisplayProps {
    header: string
    title: string | number
    subtitle?: string
}

export function CircularDataDisplay(props: CircularDataDisplayProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            <Typography className={classes.header} variant="h6" color="textPrimary">
                {props.header}
            </Typography>
            <div className={classes.circleData}>
                <div className={classes.circleDataText}>
                    <Typography variant="h6" color="textPrimary">
                        {props.title}
                    </Typography>
                    {props.subtitle && (
                        <Typography variant="subtitle1" color="textSecondary">
                            {props.subtitle}
                        </Typography>
                    )}
                </div>
            </div>
        </div>
    )
}
