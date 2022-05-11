import { Link, Stack, Typography } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { resolveDaysName } from '../../pipes'
import classNames from 'classnames'

const useStyles = makeStyles()((theme) => ({
    root: {
        background: theme.palette.background.input,
        borderRadius: 28,
        fontSize: 14,
        padding: theme.spacing(0.5),
    },
    active: {
        boxShadow: '0px 2px 5px 1px rgba(0, 0, 0, 0.05)',
        background: theme.palette.background.paper,
        fontWeight: 700,
    },
    link: {
        padding: theme.spacing(1),
        width: '25%',
        cursor: 'pointer',
        borderRadius: 18,
        textAlign: 'center',
        color: theme.palette.text.primary,
    },
}))

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    ONE_MONTH = 30,
    ONE_YEAR = 365,
}

export interface PriceChartDaysControlProps {
    days: number
    onDaysChange?: (days: number) => void
}

export function PriceChartDaysControl(props: PriceChartDaysControlProps) {
    const { classes } = useStyles()
    return (
        <Stack className={classes.root} direction="row" gap={2}>
            {[Days.ONE_DAY, Days.ONE_WEEK, Days.ONE_MONTH, Days.ONE_YEAR, Days.MAX].map((days) => (
                <Link
                    className={classNames(classes.link, props.days === days ? classes.active : '')}
                    key={days}
                    onClick={() => props.onDaysChange?.(days)}>
                    <Typography component="span">{resolveDaysName(days)}</Typography>
                </Link>
            ))}
        </Stack>
    )
}
