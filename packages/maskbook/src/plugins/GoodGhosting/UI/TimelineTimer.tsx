import { Grid, Typography } from '@material-ui/core'
import { makeStyles } from '@masknet/theme'
import isBefore from 'date-fns/isBefore'
import intervalToDuration from 'date-fns/intervalToDuration'
import formatDuration from 'date-fns/formatDuration'
import { useEffect, useState } from 'react'
import { useI18N } from '../../../utils'
import { useTimeline } from '../hooks/useGameInfo'
import type { GoodGhostingInfo } from '../types'
import { isEndOfTimeline, getNextTimelineIndex } from '../utils'
import { GameAction } from './GameAction'

const useStyles = makeStyles()((theme) => ({
    timer: {
        textAlign: 'center',
        display: 'inline-block',
        padding: theme.spacing(1, 4),
        margin: theme.spacing(2, 0),
        border: `solid 1px ${theme.palette.divider}`,
        borderRadius: theme.shape.borderRadius,
    },
    eventText: {
        padding: theme.spacing(0.5, 6, 1, 6),
    },
}))

interface TimelineTimerProps {
    info: GoodGhostingInfo
}

export function TimelineTimer(props: TimelineTimerProps) {
    const { classes } = useStyles()
    const { t } = useI18N()

    const timeline = useTimeline(props.info)

    const [timelineIndex, setTimelineIndex] = useState(getNextTimelineIndex(timeline))
    const [isLastEvent, setIsLastEvent] = useState(isEndOfTimeline(timelineIndex, timeline))

    const nextTimelineEvent = timeline[timelineIndex]

    const onUpdateTargetDate = () => {
        const index = getNextTimelineIndex(timeline)
        setTimelineIndex(index)
        setIsLastEvent(isEndOfTimeline(timelineIndex, timeline))
    }

    return (
        <Grid container justifyContent="center" alignItems="center">
            <Grid item>
                <div className={classes.timer}>
                    <Typography variant="body1" color="textSecondary">
                        {isLastEvent ? t('plugin_good_ghosting_game_end') : t('plugin_good_ghosting_next_event')}
                    </Typography>
                    <Typography variant="h5" color="textPrimary" className={classes.eventText}>
                        {isLastEvent ? t('plugin_good_ghosting_game_over') : nextTimelineEvent.eventOnDate}
                    </Typography>
                    {isLastEvent ? (
                        <Typography variant="body1" color="textSecondary">
                            {t('plugin_good_ghosting_participants_withdraw')}
                        </Typography>
                    ) : (
                        <Timer targetDate={nextTimelineEvent.date} onUpdateTargetDate={onUpdateTargetDate} />
                    )}
                    <GameAction info={props.info} />
                </div>
            </Grid>
        </Grid>
    )
}

interface TimerProps {
    targetDate: Date
    onUpdateTargetDate: () => void
}

function Timer(props: TimerProps) {
    const [dateDisplay, setDateDisplay] = useState('')
    useEffect(() => {
        const timerId = setInterval(() => {
            const now = new Date()

            if (isBefore(props.targetDate, now)) {
                clearInterval(timerId)
                props.onUpdateTargetDate()
            } else {
                const duration = intervalToDuration({
                    start: now,
                    end: props.targetDate,
                })

                setDateDisplay(
                    formatDuration(duration, {
                        zero: true,
                        format: ['days', 'hours', 'minutes', 'seconds'],
                    }),
                )
            }
        }, 1000)

        return () => clearInterval(timerId)
    }, [props.targetDate])

    return (
        <Typography variant="body1" color="textSecondary">
            {dateDisplay}
        </Typography>
    )
}
