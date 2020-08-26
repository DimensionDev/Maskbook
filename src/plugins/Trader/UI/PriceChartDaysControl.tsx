import React from 'react'
import { makeStyles, Theme, createStyles, Link, Typography } from '@material-ui/core'
import { resolveDaysName } from '../type'

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
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
    }),
)

export interface PriceChartDaysControlProps {
    days: number
    onDaysChange?: (days: number) => void
}

export function PriceChartDaysControl(props: PriceChartDaysControlProps) {
    const classes = useStyles()
    return (
        <div className={classes.root}>
            {[1, 7, 14, 30, 365].map((days) => (
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
