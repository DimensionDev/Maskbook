import { Link, Typography, type StackProps, Box } from '@mui/material'
import { makeStyles } from '@masknet/theme'
import { Days } from '@masknet/shared-base'

const useStyles = makeStyles<{ columns: number }>()((theme, { columns }) => ({
    container: {
        background: theme.palette.maskColor.input,
        borderRadius: 28,
        padding: theme.spacing(0.5),
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
    },
    active: {
        boxShadow: '0px 2px 5px 1px rgba(0, 0, 0, 0.05)',
        background: theme.palette.background.paper,
        fontWeight: 700,
    },
    link: {
        padding: theme.spacing(1, 1.5),
        cursor: 'pointer',
        flexGrow: 1,
        flexShrink: 0,
        borderRadius: 18,
        textAlign: 'center',
        color: theme.palette.text.primary,
        textDecoration: 'none !important',
    },
}))

export const DEFAULT_RANGE_OPTIONS = [Days.ONE_DAY, Days.ONE_WEEK, Days.ONE_MONTH, Days.ONE_YEAR, Days.MAX]

function resolveDaysName(days: number) {
    if (days === 0) return 'MAX'
    if (days >= 365) return `${Math.floor(days / 365)}Y`
    if (days >= 30) return `${Math.floor(days / 30)}M`
    if (days >= 7) return `${Math.floor(days / 7)}W`
    if (days === 1) return '24H'
    return `${days}d`
}
interface PriceChartDaysControlProps extends StackProps {
    days: number
    rangeOptions?: Days[]
    onDaysChange?: (days: number) => void
}

export function PriceChartRange({
    rangeOptions = DEFAULT_RANGE_OPTIONS,
    days,
    onDaysChange,
    ...rest
}: PriceChartDaysControlProps) {
    const { classes, cx } = useStyles({ columns: rangeOptions.length })
    return (
        <Box className={cx(classes.container, rest.className)} direction="row" gap={2} {...rest}>
            {rangeOptions.map((daysOption) => (
                <Link
                    className={cx(classes.link, days === daysOption ? classes.active : '')}
                    key={daysOption}
                    onClick={() => onDaysChange?.(daysOption)}>
                    <Typography sx={{ ':hover': { fontWeight: 700 } }} component="span">
                        {resolveDaysName(daysOption)}
                    </Typography>
                </Link>
            ))}
        </Box>
    )
}
