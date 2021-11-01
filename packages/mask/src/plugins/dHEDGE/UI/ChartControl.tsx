import { makeStyles } from '@masknet/theme'
import { Link, Typography } from '@mui/material'
import { Period } from '../types'

const useStyles = makeStyles()((theme) => ({
    root: {
        top: 0,
        right: 0,
        padding: theme.spacing(1, 2),
        position: 'absolute',
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
            {[Period.D1, Period.W1, Period.M1, Period.M3, Period.M6].map((period) => (
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
