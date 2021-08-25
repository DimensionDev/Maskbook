import { Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { Period } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        display: 'flex',
        justifyContent: 'flex-end',
        padding: theme.spacing(1, 2),
    },
    link: {
        cursor: 'pointer',
        marginRight: theme.spacing(1),
        '&:last-child': {
            marginRight: 0,
        },
    },
    text: {
        fontSize: 10,
        fontWeight: 300,
    },
}))

export interface PriceChartPeriodControlProps {
    period: Period
    onPeriodChange?: (period: Period) => void
}

export function PriceChartPeriodControl(props: PriceChartPeriodControlProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            {[Period.H24, Period.D7, Period.D30, Period.ALL].map((period) => (
                <Link className={classes.link} key={period} onClick={() => props.onPeriodChange?.(period)}>
                    <Typography
                        className={classes.text}
                        component="span"
                        color={props.period === period ? 'primary' : 'textSecondary'}>
                        {period}
                    </Typography>
                </Link>
            ))}
        </div>
    )
}
