import { CircularProgressProps, CircularProgress, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import { memo } from 'react'

const useStyles = makeStyles<boolean>()((_theme, overflowed) => ({
    root: {
        position: 'relative',
        display: 'inline-flex',
        marginLeft: 8,
        marginRight: 8,
    },
    circle: {
        transitionProperty: 'transform, width, height, color',
        color: overflowed ? 'red' : undefined,
    },
    label: {
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
}))
export interface CharLimitIndicatorProps extends CircularProgressProps {
    value: number
    max: number
}
export const CharLimitIndicator = memo(({ value, max, ...props }: CharLimitIndicatorProps) => {
    const displayLabel = max - value < 40
    const normalized = Math.min((value / max) * 100, 100)
    const { classes, cx } = useStyles(value >= max)
    return (
        <div className={classes.root}>
            <CircularProgress
                variant="determinate"
                color={displayLabel ? 'secondary' : 'primary'}
                size={displayLabel ? void 0 : 16}
                {...props}
                value={normalized}
                className={cx(props.className, classes.circle)}
            />
            {displayLabel ? (
                <span className={classes.label}>
                    <Typography variant="caption" component="div" color="textSecondary">
                        {max - value}
                    </Typography>
                </span>
            ) : null}
        </div>
    )
})
