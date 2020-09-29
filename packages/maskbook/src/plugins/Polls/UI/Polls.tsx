import React, { useState, useEffect } from 'react'
import { makeStyles, createStyles, Card, Typography, CircularProgress, List, ListItem, Button } from '@material-ui/core'
import { isValid, formatDistance } from 'date-fns'
import { zhTW, enUS, ja } from 'date-fns/locale'
import { useStylesExtends } from '../../../components/custom-ui-helper'
import { useI18N } from '../../../utils/i18n-next-ui'
import { useValueRef } from '../../../utils/hooks/useValueRef'
import { languageSettings } from '../../../settings/settings'
import type { PollGunDB } from '../Services'
import { PollStatus } from '../types'
import VotingHistory from './VotingHistory'

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
            alignItems: 'center',
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
        history: {
            color: theme.palette.primary.main,
        },
    }),
)

interface PollCardProps extends withClasses<KeysInferFromUseStyles<typeof useStyles> | 'button'> {
    poll: PollGunDB
    onClick?(): void
    onOpenHistoryDialog?(opt: boolean): void
    vote?(poll: PollGunDB, index: number): void
    status?: PollStatus
}

export function PollCardUI(props: PollCardProps) {
    const { poll, onClick, onOpenHistoryDialog, vote, status } = props
    const classes = useStylesExtends(useStyles(), props)
    const [historyOpen, setHistoryOpen] = useState(false)
    const isClosed = Date.now() > poll.end_time ? true : false
    const { t } = useI18N()
    const lang = useValueRef(languageSettings)

    useEffect(() => {
        onOpenHistoryDialog?.(historyOpen)
    }, [historyOpen])

    const totalVotes = poll.results.reduce(
        (accumulator: number, currentValue: number): number => accumulator + currentValue,
    )

    const getDeadline = (date: number) => {
        const deadline = new Date(date)
        if (isValid(deadline)) {
            const localeMapping = () => {
                switch (lang) {
                    case 'en':
                        return enUS
                    case 'ja':
                        return ja
                    case 'zh':
                        return zhTW
                    default:
                        return enUS
                }
            }
            const time = formatDistance(new Date(poll.start_time), new Date(poll.end_time), {
                locale: localeMapping(),
            })
            return t('plugin_poll_deadline', { time })
        } else {
            return t('plugin_poll_length_unknown')
        }
    }

    const renderPollStatusI18n = (status: PollStatus) => {
        switch (status) {
            case PollStatus.Voting:
                return t('plugin_poll_status_voting')
            case PollStatus.Voted:
                return t('plugin_poll_status_voted')
            default:
                return t('plugin_poll_status_closed')
        }
    }

    return (
        <Card
            className={classes.card}
            onClick={() => {
                setHistoryOpen(false)
                onClick?.()
            }}>
            <Typography variant="h5" className={classes.line}>
                <div style={{ fontSize: '16px' }}>{poll.question}</div>
                {!status || status === PollStatus.Inactive ? null : (
                    <div className={classes.status}>
                        {status === PollStatus.Voting ? <CircularProgress size={18} /> : null}
                        <span className={classes.statusText}>{renderPollStatusI18n(status)}</span>
                    </div>
                )}
            </Typography>
            <List>
                {poll.options.map((option, index) => (
                    <ListItem
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
                    </ListItem>
                ))}
            </List>
            <Typography variant="body2" className={classes.line}>
                <Typography component="span" className={classes.deadline}>
                    {isClosed ? `${t('plugin_poll_status_closed')}` : `${getDeadline(poll.end_time)}`}
                </Typography>
                <Button
                    className={classes.button}
                    color="primary"
                    variant="contained"
                    onClick={(e) => {
                        e.stopPropagation()
                        setHistoryOpen(true)
                    }}>
                    {t('plugin_poll_voting_history')}
                </Button>
            </Typography>
            <VotingHistory
                poll={poll}
                open={historyOpen}
                onDecline={() => {
                    setHistoryOpen(false)
                }}
            />
        </Card>
    )
}
