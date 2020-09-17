import React from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress } from '@material-ui/core'
import type { PollGunDB } from '../Services'
import { format, isValid } from 'date-fns'

const useStyles = makeStyles((theme) =>
    createStyles({
        card: {
            borderRadius: theme.spacing(1),
            margin: theme.spacing(2, 0),
            padding: theme.spacing(2),
        },
        line: {
            display: 'flex',
            justifyContent: 'space-between',
        },
        status: {
            display: 'flex',
            alignItems: 'center',
        },
        statusText: {
            margin: '3px',
            fontSize: '13px',
            color: theme.palette.primary.main,
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
    status?: PollStatus
}

export enum PollStatus {
    Voted = 'Voted.',
    Voting = 'Voting',
    Error = 'Error',
    Closed = 'Closed',
    Inactive = 'Inactive',
}

export function PollCardUI(props: PollCardProps) {
    const { poll, onClick, vote, status } = props
    const classes = useStyles()
    const isClosed = Date.now() > poll.end_time ? true : false

    const totalVotes = poll.results.reduce(
        (accumulator: number, currentValue: number): number => accumulator + currentValue,
    )

    const getDeadline = (date: number) => {
        const deadline = new Date(date)
        if (isValid(deadline)) {
            return `Deadline: ${format(deadline, 'yyyy-MM-dd HH:mm:ss')}`
        } else {
            return 'sorry, cannot get correct deadline...'
        }
    }

    return (
        <Card className={classes.card} onClick={() => onClick?.()}>
            <div className={classes.line}>
                <div style={{ fontSize: '16px' }}>{poll.question}</div>
                {!status || status === PollStatus.Inactive ? null : (
                    <div className={classes.status}>
                        {status === PollStatus.Voting ? <CircularProgress size={18} /> : null}
                        <span className={classes.statusText}>{status}</span>
                    </div>
                )}
            </div>
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
                {isClosed ? 'Closed' : `${getDeadline(poll.end_time)}`}
            </Typography>
        </Card>
    )
}
