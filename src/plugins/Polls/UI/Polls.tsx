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
            height: '28px',
        },
        bar: {
            backgroundColor: theme.palette.primary.main,
            minWidth: theme.spacing(1),
            height: '28px',
            borderRadius: theme.spacing(0.8),
        },
        text: {
            marginLeft: theme.spacing(0.5),
            lineHeight: '28px',
        },
        deadline: {
            color: '#657786',
        },
    }),
)

interface PollCardProps {
    poll: PollGunDB
    onClick?(): void
}

export function PollCardUI(props: PollCardProps) {
    const { poll, onClick } = props
    const classes = useStyles()
    const isClosed = new Date().getTime() > poll.end_time ? true : false

    return (
        <Card className={classes.card} onClick={() => onClick?.()}>
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
            <Typography variant="body2" classes={{ root: classes.deadline }}>
                {isClosed ? 'Closed' : `Deadline: ${dateFormat('YYYY-mm-dd HH:MM', new Date(poll.end_time))}`}
            </Typography>
        </Card>
    )
}
