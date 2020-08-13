import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Card, Typography } from '@material-ui/core'
import Services from '../../../extension/service'
import { getActivatedUI } from '../../../social-network/ui'
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
            position: 'relative',
            display: 'flex',
            justifyContent: 'space-between',
            margin: theme.spacing(1, 0),
            padding: theme.spacing(0, 1),
            height: '28px',
        },
        bar: {
            position: 'absolute',
            top: '0',
            left: '0',
            zIndex: 100,
            backgroundColor: theme.palette.primary.main,
            opacity: 0.6,
            minWidth: theme.spacing(1),
            height: '28px',
            borderRadius: theme.spacing(0.8),
        },
        text: {
            zIndex: 101,
            lineHeight: '28px',
            margin: '0 4px',
        },
        deadline: {
            color: '#657786',
        },
    }),
)

interface PollCardProps {
    poll: PollGunDB
    onClick?(): void
    vote?(poll: PollGunDB, index: number): void
}

export function PollCardUI(props: PollCardProps) {
    const { poll, onClick, vote } = props
    const classes = useStyles()
    const isClosed = new Date().getTime() > poll.end_time ? true : false

    const totalVotes = poll.results.reduce(
        (accumulator: number, currentValue: number): number => accumulator + currentValue,
    )

    return (
        <Card className={classes.card} onClick={() => onClick?.()}>
            <Typography variant="h5" color="inherit">
                {poll.question}
            </Typography>
            <div>
                {poll.options.map((option, index) => (
                    <div
                        className={classes.option}
                        key={index}
                        onClick={() => {
                            vote?.(poll, index)
                        }}>
                        <div
                            style={{
                                display: 'flex',
                            }}>
                            <div
                                className={classes.bar}
                                style={{
                                    width: `${(poll.results[index] / totalVotes) * 100}%`,
                                }}></div>
                            <div className={classes.text}>{option}</div>
                        </div>
                        <div className={classes.text}>{poll.results[index]}</div>
                    </div>
                ))}
            </div>
            <Typography variant="body2" classes={{ root: classes.deadline }}>
                {isClosed ? 'Closed' : `Deadline: ${dateFormat('YYYY-mm-dd HH:MM', new Date(poll.end_time))}`}
            </Typography>
        </Card>
    )
}
