import { Link, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { resolveDaysName } from '../../pipes'

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

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    TWO_WEEKS = 14,
    ONE_MONTH = 30,
    THREE_MONTHS = 90,
    ONE_YEAR = 365,
}

export interface PriceChartDaysControlProps {
    days: number
    onDaysChange?: (days: number) => void
}

export function PriceChartDaysControl(props: PriceChartDaysControlProps) {
    const { classes } = useStyles()
    return (
        <div className={classes.root}>
            {[
                Days.ONE_DAY,
                Days.ONE_WEEK,
                Days.TWO_WEEKS,
                Days.ONE_MONTH,
                Days.THREE_MONTHS,
                Days.ONE_YEAR,
                Days.MAX,
            ].map((days) => (
                <Link className={classes.link} key={days} onClick={() => props.onDaysChange?.(days)}>
                    <Typography
                        className={classes.text}
                        component="span"
                        color={props.days === days ? 'primary' : 'textSecondary'}>
                        {resolveDaysName(days)}
                    </Typography>
                </Link>
            ))}
        </div>
    )
}
