import { makeStyles, Grid, Typography } from '@material-ui/core'
import type { GoodGhostingInfo, TimelineEvent } from '../types'
import { format as formatDateTime, isBefore } from 'date-fns'
import classNames from 'classnames'
import addSeconds from 'date-fns/addSeconds'
import { useMemo } from 'react'

const useStyles = makeStyles((theme) => ({
    text: {
        whiteSpace: 'nowrap',
    },
    timelineWrapper: {
        overflowX: 'auto',
    },
    timeline: {
        margin: theme.spacing(1),
        overflow: 'visible',
        flexWrap: 'nowrap',
        alignItems: 'flex-end',
    },
    timelinePadding: {
        height: '1px',
        paddingLeft: theme.spacing(10),
    },
    timelineCells: {
        position: 'relative',
        overflow: 'visible',
    },
    eventText: {
        position: 'relative',
        padding: theme.spacing(1.5, 2),
        margin: theme.spacing(1.5),
        marginTop: '0px',
        borderTop: '1px solid #D9E0F0',
        whiteSpace: 'nowrap',
    },
    rightAligned: {
        position: 'absolute',
        right: `calc(-4px - ${theme.spacing(1.5)})`,
        top: '-4px',
    },
    timelineEvent: {
        position: 'relative',
        left: '0px',
        transform: 'translateX(50%)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        bottom: '-4px',
        width: '1px',
    },
    circleIndicator: {
        borderRadius: '100%',
        width: '8px',
        height: '8px',
        border: '2px solid #8E79FC',
        boxSizing: 'border-box',
    },
    circleIndicatorFilled: {
        background: '#8E79FC',
    },
    circleIndicatorEmpty: {
        background: 'none',
    },
    verticalLine: {
        width: '1px',
        background: '#D9E0F0',
        marginBottom: theme.spacing(1),
    },
    tallVeritcalLine: {
        height: '120px',
    },
    shortVeritcalLine: {
        height: '50px',
    },
}))

interface TimelineViewProps {
    info: GoodGhostingInfo
}

export function TimelineView(props: TimelineViewProps) {
    const classes = useStyles()

    const getTimelineEvent = (index: number, numberOfRounds: number) => {
        if (index === 0) {
            return {
                eventOnDate: `Game Launched`,
                ongoingEvent: `Join Round`,
            }
        } else if (index === 1) {
            return {
                eventOnDate: `Join Deadline`,
                ongoingEvent: `Deposit ${index + 1}`,
            }
        } else if (index === numberOfRounds - 1) {
            return {
                eventOnDate: `Deposit Deadline ${numberOfRounds - 1}`,
                ongoingEvent: `Waiting Round`,
            }
        } else if (index === numberOfRounds) {
            return {
                eventOnDate: `Waiting Period Ends`,
                ongoingEvent: `Withdraw`,
            }
        } else {
            return {
                eventOnDate: `Deposit Deadline ${index}`,
                ongoingEvent: `Deposit ${index + 1}`,
            }
        }
    }

    const startTime = props.info.firstSegmentStart
    const roundDuration = props.info.segmentLength
    const numberOfRounds = props.info.lastSegment && props.info.lastSegment + 1

    const timeline: TimelineEvent[] = useMemo(() => {
        if (!startTime || !roundDuration || !numberOfRounds) return []
        const initialDate = new Date(startTime * 1000)
        const rounds: TimelineEvent[] = []
        for (let i = 0; i <= numberOfRounds; i++) {
            rounds.push({
                date: addSeconds(initialDate, roundDuration * i),
                ...getTimelineEvent(i, numberOfRounds),
            })
        }
        return rounds
    }, [startTime, roundDuration, numberOfRounds])

    return (
        <div className={classes.timelineWrapper}>
            <Grid container className={classes.timeline}>
                <Grid item className={classes.timelinePadding}></Grid>
                {timeline.map((timelineEvent, index) => (
                    <Grid item className={classes.timelineCells} key={`timeline-${timelineEvent.date.toString()}`}>
                        <div className={classes.timelineEvent}>
                            <Typography variant="caption" color="textSecondary" className={classes.text}>
                                {timelineEvent.eventOnDate}
                            </Typography>
                            <Typography variant="subtitle2" color="textPrimary" className={classes.text}>
                                {formatDateTime(timelineEvent.date, 'HH:mm EEE d LLL O')}
                            </Typography>
                            <div
                                className={classNames(
                                    classes.verticalLine,
                                    index % 2 === 0 ? classes.tallVeritcalLine : classes.shortVeritcalLine,
                                )}></div>
                            <div
                                className={classNames(
                                    classes.circleIndicator,
                                    isBefore(new Date(), timelineEvent.date)
                                        ? classes.circleIndicatorFilled
                                        : classes.circleIndicatorEmpty,
                                )}></div>
                        </div>
                        <div className={classes.eventText}>
                            {index === timeline.length - 1 && (
                                <div
                                    className={classNames(
                                        classes.circleIndicator,
                                        classes.circleIndicatorFilled,
                                        classes.rightAligned,
                                    )}></div>
                            )}
                            <Typography variant="caption" color="textSecondary" className={classes.text}>
                                {timelineEvent.ongoingEvent}
                            </Typography>
                        </div>
                    </Grid>
                ))}
                <Grid item className={classes.timelinePadding}></Grid>
            </Grid>
        </div>
    )
}
