import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Card, Typography } from '@material-ui/core'
import type { PollGunDB } from '../Services'
import { dateFormat } from '../utils'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
            padding: theme.spacing(2),
        },
        option: {
            display: 'flex',
            justifyContent: 'space-between',
            margin: theme.spacing(1, 0),
            height: '20px',
        },
        bar: {
            backgroundColor: theme.palette.primary.main,
            minWidth: theme.spacing(1),
            height: '20px',
            borderRadius: theme.spacing(0.8),
        },
        text: {
            marginLeft: theme.spacing(0.5),
        },
    }),
)

interface PollCardProps {
    poll: PollGunDB
}

export function PollCardUI(props: PollCardProps) {
    const { poll } = props
    const classes = useStyles()

    return (
        <Card className={classes.card}>
            <Typography variant="h5" color="inherit">
                {poll.question}
            </Typography>
            <div>
                {poll.options.map((option, index) => (
                    <div className={classes.option} key={index}>
                        <div
                            style={{
                                display: 'flex',
                            }}>
                            <div className={classes.bar}></div>
                            <div className={classes.text}>{option}</div>
                        </div>
                        <div>{poll.results[index]}</div>
                    </div>
                ))}
            </div>
            <Typography variant="body2" color="inherit">
                {dateFormat('YYYY-mm-dd', new Date(poll.start_time))}
            </Typography>
        </Card>
    )
}
