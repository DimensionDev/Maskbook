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
        textDecoration: 'none !important',
    },
}))

export enum Days {
    MAX = 0,
    ONE_DAY = 1,
    ONE_WEEK = 7,
    ONE_MONTH = 30,
    THREE_MONTHS = 90,
    ONE_YEAR = 365,
}

export const DEFAULT_RANGE_OPTIONS = [Days.ONE_DAY, Days.ONE_WEEK, Days.ONE_MONTH, Days.ONE_YEAR, Days.MAX]
export const NFT_RANGE_OPTIONS = [Days.ONE_DAY, Days.ONE_WEEK, Days.ONE_MONTH, Days.THREE_MONTHS]

export interface PriceChartDaysControlProps {
    days: number
    rangeOptions?: Days[]
    onDaysChange?: (days: number) => void
}

export function PriceChartDaysControl({
    rangeOptions = DEFAULT_RANGE_OPTIONS,
    days,
    onDaysChange,
}: PriceChartDaysControlProps) {
    const { classes } = useStyles()
    return (
        <Stack className={classes.root} direction="row" gap={2}>
            {rangeOptions.map((daysOption) => (
                <Link
                    className={classNames(classes.link, days === daysOption ? classes.active : '')}
                    key={daysOption}
                    onClick={() => onDaysChange?.(daysOption)}>
                    <Typography sx={{ ':hover': { fontWeight: 700 } }} component="span">
                        {resolveDaysName(daysOption)}
                    </Typography>
                </Link>
            ))}
        </Stack>
    )
}
